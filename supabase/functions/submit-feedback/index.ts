import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetIn = record.resetTime - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

// Verify signed challenge token
async function verifyChallenge(token: string, userAnswer: number, secret: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const tokenData = atob(token);
    const [expectedAnswerStr, timestampStr, signature] = tokenData.split(':');
    
    const expectedAnswer = parseInt(expectedAnswerStr, 10);
    const timestamp = parseInt(timestampStr, 10);
    
    if (isNaN(expectedAnswer) || isNaN(timestamp)) {
      return { valid: false, reason: 'Invalid token format' };
    }
    
    // Check expiry
    if (Date.now() - timestamp > CHALLENGE_EXPIRY_MS) {
      return { valid: false, reason: 'Challenge expired' };
    }
    
    // Verify signature
    const encoder = new TextEncoder();
    const data = `${expectedAnswer}:${timestamp}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(expectedSig));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid signature' };
    }
    
    // Verify answer
    if (userAnswer !== expectedAnswer) {
      return { valid: false, reason: 'Incorrect answer' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Challenge verification error:', error);
    return { valid: false, reason: 'Verification failed' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const clientIP = getClientIP(req);
    console.log('Feedback submission attempt from IP:', clientIP);

    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
      console.log('Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ 
          error: 'Too many feedback submissions. Please try again later.',
          resetIn: resetMinutes
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      );
    }

    const body = await req.json();
    const { 
      user_type, 
      app_section, 
      issue_type, 
      other_details,
      challenge_token,
      challenge_answer
    } = body;

    // Validate required fields
    if (!user_type || !app_section || !issue_type) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate field lengths
    if (user_type.length > 100 || app_section.length > 100 || issue_type.length > 100) {
      console.log('Field too long');
      return new Response(
        JSON.stringify({ error: 'Field value too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (other_details && other_details.length > 1000) {
      console.log('Details too long');
      return new Response(
        JSON.stringify({ error: 'Details field too long (max 1000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate challenge token and answer
    if (!challenge_token || challenge_answer === undefined) {
      console.log('Missing challenge data');
      return new Response(
        JSON.stringify({ error: 'Please complete the human verification' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signingSecret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const verification = await verifyChallenge(challenge_token, challenge_answer, signingSecret);
    
    if (!verification.valid) {
      console.log('Challenge failed:', verification.reason);
      return new Response(
        JSON.stringify({ error: verification.reason === 'Challenge expired' 
          ? 'Challenge expired. Please get a new question.' 
          : 'Human verification failed. Please try again.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase.from('feedback').insert({
      user_type,
      app_section,
      issue_type,
      other_details: other_details?.trim() || null,
    });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Feedback submitted successfully from IP:', clientIP);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Feedback submitted successfully',
        remaining: rateLimit.remaining
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimit.remaining)
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
