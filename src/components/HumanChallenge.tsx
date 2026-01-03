import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

interface MathChallenge {
  type: 'math';
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
  question: string;
}

interface HumanChallengeProps {
  onVerified: (challengeData: { type: string; answer: number; expected: number }) => void;
  onReset: () => void;
}

function generateMathChallenge(): MathChallenge {
  const operators: Array<'+' | '-'> = ['+', '-'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1: number, num2: number, answer: number;
  
  if (operator === '+') {
    num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    answer = num1 + num2;
  } else {
    // Ensure positive result for subtraction
    num1 = Math.floor(Math.random() * 10) + 5; // 5-14
    num2 = Math.floor(Math.random() * Math.min(num1, 10)) + 1; // 1-min(num1,10)
    answer = num1 - num2;
  }
  
  return {
    type: 'math',
    num1,
    num2,
    operator,
    answer,
    question: `${num1} ${operator} ${num2} = ?`
  };
}

export function HumanChallenge({ onVerified, onReset }: HumanChallengeProps) {
  const [challenge, setChallenge] = useState<MathChallenge>(() => generateMathChallenge());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [options, setOptions] = useState<number[]>([]);

  // Generate answer options
  useEffect(() => {
    const correctAnswer = challenge.answer;
    const wrongAnswers = new Set<number>();
    
    // Generate 3 wrong answers that are close but not equal to correct
    while (wrongAnswers.size < 3) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const wrong = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
      if (wrong !== correctAnswer && wrong >= 0 && wrong <= 25) {
        wrongAnswers.add(wrong);
      }
    }
    
    // Shuffle options
    const allOptions = [correctAnswer, ...Array.from(wrongAnswers)];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    setOptions(allOptions);
  }, [challenge]);

  const handleSelect = useCallback((answer: number) => {
    setSelectedAnswer(answer);
    
    if (answer === challenge.answer) {
      setIsVerified(true);
      onVerified({
        type: 'math',
        answer,
        expected: challenge.answer
      });
    }
  }, [challenge.answer, onVerified]);

  const handleRefresh = useCallback(() => {
    setChallenge(generateMathChallenge());
    setSelectedAnswer(null);
    setIsVerified(false);
    onReset();
  }, [onReset]);

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
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === challenge.answer;
          const showCorrect = isVerified && isCorrect;
          const showWrong = isSelected && !isCorrect;

          return (
            <motion.button
              key={option}
              onClick={() => !isVerified && handleSelect(option)}
              disabled={isVerified}
              whileTap={{ scale: isVerified ? 1 : 0.95 }}
              className={`
                py-3 px-2 rounded-lg font-medium text-base transition-all
                ${showCorrect 
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400' 
                  : showWrong
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                    : isSelected
                      ? 'bg-primary/20 border-2 border-primary text-primary'
                      : 'bg-surface border border-border text-foreground hover:border-primary/50'
                }
                ${isVerified ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {showCorrect ? (
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
          ✓ Verified! You can submit now.
        </motion.p>
      )}

      {selectedAnswer !== null && !isVerified && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-red-400">
            Not quite! Try again.
          </p>
          <button
            onClick={handleRefresh}
            className="text-sm text-primary hover:underline"
          >
            Get a new question
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
