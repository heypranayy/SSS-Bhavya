'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface EnquiryCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export function EnquiryCaptcha({ onVerify, className = '' }: EnquiryCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const generateChallenge = useCallback(() => {
    // Generate two numbers between 2 and 15
    const n1 = Math.floor(Math.random() * 12) + 3;
    const n2 = Math.floor(Math.random() * 9) + 2;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setIsAnswerCorrect(false);
    setHasInteracted(false);
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setUserAnswer(val);
    setHasInteracted(true);

    const expected = num1 + num2;
    if (parseInt(val, 10) === expected) {
      setIsAnswerCorrect(true);
      onVerify(true);
    } else {
      setIsAnswerCorrect(false);
      onVerify(false);
    }
  };

  return (
    <div className={`p-3 rounded-xl border transition-all ${
      isAnswerCorrect
        ? 'bg-emerald-50/70 border-emerald-300'
        : hasInteracted && userAnswer
        ? 'bg-red-50/70 border-red-300'
        : 'bg-[#FAF7F2] border-[#E7E0D5]'
    } ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
          <ShieldCheck className={`w-4 h-4 ${isAnswerCorrect ? 'text-emerald-600' : 'text-[#722F37]'}`} />
          <span>Security Verification (Anti-Spam)</span>
        </div>

        <button
          type="button"
          onClick={generateChallenge}
          className="text-zinc-400 hover:text-[#722F37] p-1 rounded transition-colors"
          title="New security challenge"
          aria-label="New security challenge"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E7E0D5] font-mono text-xs font-bold text-zinc-900 tracking-wider shadow-2xs select-none">
          <span>{num1}</span>
          <span className="text-[#722F37]">+</span>
          <span>{num2}</span>
          <span className="text-zinc-400">=</span>
        </div>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          value={userAnswer}
          onChange={handleInputChange}
          placeholder="Answer"
          aria-label="Security verification answer"
          className={`w-20 text-xs p-1.5 rounded-lg border bg-white font-mono font-bold text-center focus:outline-none transition-colors ${
            isAnswerCorrect
              ? 'border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
              : hasInteracted && userAnswer
              ? 'border-red-400 text-red-700'
              : 'border-[#E7E0D5] text-zinc-800 focus:border-[#722F37]'
          }`}
        />

        <div className="flex-1 text-[11px]">
          {isAnswerCorrect ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Verified Human</span>
            </span>
          ) : hasInteracted && userAnswer ? (
            <span className="text-red-600 font-medium">Incorrect answer</span>
          ) : (
            <span className="text-zinc-500 font-light">Type sum to verify</span>
          )}
        </div>
      </div>
    </div>
  );
}
