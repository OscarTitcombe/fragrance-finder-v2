'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuiz } from '@/lib/useQuiz';
import { useEffect, useState, useRef } from 'react';

export default function QuizStep() {
  const params = useParams();
  const router = useRouter();
  const step = parseInt(params.step as string);
  
  const {
    setAnswer,
    getCurrentQuestion,
    getProgress,
    totalQuestions,
    answers,
    clearAnswers
  } = useQuiz();

  const currentQuestion = getCurrentQuestion(step);
  const progress = getProgress(step);

  const isMulti = !!currentQuestion?.multi;

  // Local state for selected answer(s)
  const [selected, setSelected] = useState<string[] | string | null>(
    answers[currentQuestion?.id ?? ""] || (isMulti ? [] : null)
  );
  const [animateOut, setAnimateOut] = useState(false); // For fade/slide
  const [shake, setShake] = useState(false); // For shake on invalid
  const [progressPulse, setProgressPulse] = useState(false); // For progress bar pulse
  const prevStep = useRef(step);

  // Clear answers when starting a new quiz (step 1)
  useEffect(() => {
    if (step === 1) {
      clearAnswers();
    }
  }, [step, clearAnswers]);

  // Update selected state if answers change (e.g., on back/forward navigation)
  useEffect(() => {
    setSelected(answers[currentQuestion?.id ?? ""] || (isMulti ? [] : null));
  }, [currentQuestion, answers, isMulti]);

  // Animate question transition on step change
  useEffect(() => {
    if (prevStep.current !== step) {
      setAnimateOut(true);
      setTimeout(() => {
        setAnimateOut(false);
      }, 350);
    }
    prevStep.current = step;
  }, [step]);

  // Progress bar pulse on step change
  useEffect(() => {
    if (prevStep.current !== step) {
      setProgressPulse(true);
      setTimeout(() => setProgressPulse(false), 400);
    }
  }, [step]);

  // Handle answer selection
  const handleSelect = (value: string) => {
    if (isMulti) {
      setSelected(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      });
    } else {
      setSelected(value);
    }
  };

  // Handle Next button
  const isAnswered = isMulti ? Array.isArray(selected) && selected.length > 0 : !!selected;
  const handleNext = () => {
    if (!currentQuestion || !isAnswered) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    if (isMulti) {
      setAnswer(currentQuestion.id, Array.isArray(selected) ? selected : []);
    } else {
      setAnswer(currentQuestion.id, typeof selected === 'string' ? selected : '');
    }
    if (step === totalQuestions) {
      const updatedAnswers = { ...answers, [currentQuestion.id]: selected };
      // Flatten all answers to a tag array for the cookie
      const tagArray = Object.values(updatedAnswers).flat();
      document.cookie = `quiz_tags=${JSON.stringify(tagArray)}; path=/; max-age=3600`;
      window.location.href = '/loading';
    } else {
      router.push(`/quiz/${step + 1}`);
    }
  };

  // Handle Back button
  const handleBack = () => {
    if (step > 1) {
      router.push(`/quiz/${step - 1}`);
    }
  };

  // Handle Skip to Results
  const handleSkip = () => {
    const tagArray = Object.values(answers).flat();
    document.cookie = `quiz_tags=${JSON.stringify(tagArray)}; path=/; max-age=3600`;
    window.location.href = '/loading';
  };

  // Handle invalid step
  if (!currentQuestion) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center px-4 pt-20 font-jakarta">
        <h1 className="text-4xl font-semibold mb-6">Invalid Step</h1>
        <p className="text-base text-gray-600">This quiz step doesn&apos;t exist. Please start over.</p>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] flex flex-col justify-center items-center font-jakarta">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Green progress bar */}
        <div className="w-full mt-4">
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${progressPulse ? 'animate-pulse-bar' : ''}`}
              style={{ width: `${progress}%`, background: '#228B22' }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2 text-right">
            Question {step} of {totalQuestions}
          </div>
        </div>

        {/* Question */}
        <div className={`transition-all duration-500 ${animateOut ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} ${shake ? 'animate-shake' : ''}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
            {currentQuestion.question}
          </h2>

          {/* Answer options as cards */}
          <div className="flex flex-col gap-4">
            {currentQuestion.options.map((option) => {
              const isSelected = isMulti
                ? Array.isArray(selected) && selected.includes(option.value)
                : selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left rounded-xl border px-5 py-4 font-medium text-base shadow-sm transition-all duration-200
                    hover:scale-101 hover:shadow-sm active:scale-98
                    ${isSelected
                      ? "border-[#388e3c] bg-[#f3f7f3] text-green-900 ring-2 ring-[#388e3c]"
                      : "border-neutral-200 bg-transparent hover:border-[#388e3c] hover:bg-[#f3f7f3]"}
                  `}
                  style={{ transitionProperty: 'box-shadow, transform, border, background' }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-row gap-4 mb-2">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex-1 py-4 rounded-xl font-semibold text-base transition-colors active:scale-95
              bg-neutral-200 text-black hover:bg-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400 shadow-md`}
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)', transition: 'box-shadow, transform 0.15s' }}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`flex-1 py-4 rounded-xl font-semibold text-base transition-colors active:scale-95
              bg-gradient-to-b from-black via-neutral-900 via-70% to-neutral-700 text-white hover:from-neutral-900 hover:to-neutral-600 shadow-lg
              ${!isAnswered ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.28)', transition: 'box-shadow, transform 0.15s' }}
          >
            Next
          </button>
        </div>
        <button
          onClick={handleSkip}
          className="w-full py-2 rounded-lg font-semibold text-base border border-neutral-200 bg-white text-black hover:bg-neutral-100 transition-all mb-4 mt-0 shadow-md text-center active:scale-95"
          style={{ fontWeight: 500, fontSize: '15px', minHeight: 'unset', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)', transition: 'box-shadow, transform 0.15s' }}
        >
          Skip to Results
        </button>
      </div>
    </main>
  );
} 