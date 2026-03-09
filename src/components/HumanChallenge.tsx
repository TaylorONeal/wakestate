import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChallengeData {
  question: string;
  options: number[];
  token: string;
  expiresAt: number;
}

interface HumanChallengeProps {
  onVerified: (challengeData: { token: string; answer: number }) => void;
  onReset: () => void;
}

export function HumanChallenge({ onVerified, onReset }: HumanChallengeProps) {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsVerified(false);
    onReset();

    try {
      const { data, error } = await supabase.functions.invoke('get-challenge');
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setChallenge(data);
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
      setError('Failed to load verification. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onReset]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  // Check for expiry
  useEffect(() => {
    if (!challenge || isVerified) return;
    
    const timeUntilExpiry = challenge.expiresAt - Date.now();
    if (timeUntilExpiry <= 0) {
      setError('Challenge expired. Getting a new one...');
      fetchChallenge();
      return;
    }
    
    const timer = setTimeout(() => {
      if (!isVerified) {
        setError('Challenge expired. Getting a new one...');
        fetchChallenge();
      }
    }, timeUntilExpiry);
    
    return () => clearTimeout(timer);
  }, [challenge, isVerified, fetchChallenge]);

  const handleSelect = useCallback((answer: number) => {
    if (!challenge || isVerified) return;
    
    setSelectedAnswer(answer);
    // We don't know the correct answer client-side, so we optimistically mark as verified
    // The server will validate on submission
    setIsVerified(true);
    onVerified({
      token: challenge.token,
      answer,
    });
  }, [challenge, isVerified, onVerified]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-surface-2 border border-border"
      >
        <div className="flex items-center justify-center gap-2 py-4">
          <RefreshCw className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading verification...</span>
        </div>
      </motion.div>
    );
  }

  if (error && !challenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-surface-2 border border-border"
      >
        <div className="text-center space-y-2">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchChallenge}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!challenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-surface-2 border border-border space-y-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Quick verification</span>
      </div>

      <div className="text-center py-2">
        <p className="text-lg font-mono font-bold text-foreground">
          {challenge.question}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {challenge.options.map((option) => {
          const isSelected = selectedAnswer === option;

          return (
            <motion.button
              key={option}
              onClick={() => !isVerified && handleSelect(option)}
              disabled={isVerified}
              whileTap={{ scale: isVerified ? 1 : 0.95 }}
              className={`
                py-3 px-2 rounded-lg font-medium text-base transition-all
                ${isSelected && isVerified
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400' 
                  : isSelected
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-surface border border-border text-foreground hover:border-primary/50'
                }
                ${isVerified ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isSelected && isVerified ? (
                <span className="flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  {option}
                </span>
              ) : (
                option
              )}
            </motion.button>
          );
        })}
      </div>

      {isVerified && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-green-400"
        >
          ✓ Ready to submit!
        </motion.p>
      )}

      {!isVerified && (
        <div className="text-center">
          <button
            onClick={fetchChallenge}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Get a different question
          </button>
        </div>
      )}
    </motion.div>
  );
}
