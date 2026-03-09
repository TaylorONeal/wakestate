import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MathChallenge {
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
}

function generateMathChallenge(): MathChallenge {
  const operators: Array<'+' | '-'> = ['+', '-'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1: number, num2: number, answer: number;
  
  if (operator === '+') {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    answer = num1 + num2;
  } else {
    num1 = Math.floor(Math.random() * 10) + 5;
    num2 = Math.floor(Math.random() * Math.min(num1, 10)) + 1;
    answer = num1 - num2;
  }
  
  return { num1, num2, operator, answer };
}

// Simple HMAC-like signing using Web Crypto API
async function signChallenge(answer: number, timestamp: number, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = `${answer}:${timestamp}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const challenge = generateMathChallenge();
    const timestamp = Date.now();
    
    // Use service role key as signing secret (always available)
    const signingSecret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const signature = await signChallenge(challenge.answer, timestamp, signingSecret);
    
    // Create token: base64(answer:timestamp:signature)
    const tokenData = `${challenge.answer}:${timestamp}:${signature}`;
    const token = btoa(tokenData);
    
    return new Response(
      JSON.stringify({
        question: `${challenge.num1} ${challenge.operator} ${challenge.num2} = ?`,
        options: generateOptions(challenge.answer),
        token, // Opaque token containing signed answer
        expiresAt: timestamp + 5 * 60 * 1000, // 5 minutes
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Challenge generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate challenge' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateOptions(correctAnswer: number): number[] {
  const wrongAnswers = new Set<number>();
  
  while (wrongAnswers.size < 3) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const wrong = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
    if (wrong !== correctAnswer && wrong >= 0 && wrong <= 25) {
      wrongAnswers.add(wrong);
    }
  }
  
  const allOptions = [correctAnswer, ...Array.from(wrongAnswers)];
  // Shuffle
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }
  
  return allOptions;
}
