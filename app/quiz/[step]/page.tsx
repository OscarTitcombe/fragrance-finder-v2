'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuiz } from '@/lib/useQuiz';
import { useEffect, useState } from 'react';

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

  // Local state for selected answer for immediate feedback
  const [selected, setSelected] = useState<string | null>(
    answers[currentQuestion?.id ?? ""] || null
  );

  // Clear answers when starting a new quiz (step 1)
  useEffect(() => {
    if (step === 1) {
      clearAnswers();
    }
  }, [step, clearAnswers]);

  // Update selected state if answers change (e.g., on back/forward navigation)
  useEffect(() => {
    setSelected(answers[currentQuestion?.id ?? ""] || null);
  }, [currentQuestion, answers]);

  // Handle answer selection
  const handleSelect = (value: string) => {
    setSelected(value);
  };

  // Handle Next button
  const handleNext = () => {
    if (!currentQuestion || !selected) return;
    setAnswer(currentQuestion.id, selected);
    if (step === totalQuestions) {
      const updatedAnswers = { ...answers, [currentQuestion.id]: selected };
      const tagArray = Object.values(updatedAnswers);
      document.cookie = `quiz_tags=${JSON.stringify(tagArray)}; path=/; max-age=3600`;
      window.location.href = '/loading';
    } else {
      router.push(`/quiz/${step + 1}`);
    }
  };

  // Handle Skip to Results
  const handleSkip = () => {
    window.location.href = '/loading';
  };

  // Handle invalid step
  if (!currentQuestion) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center px-4 pt-20 font-jakarta">
        <h1 className="text-4xl font-semibold mb-6">Invalid Step</h1>
        <p className="text-base text-gray-600">This quiz step doesn't exist. Please start over.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 pt-20 font-jakarta">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Green progress bar */}
        <div className="w-full mt-4">
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2 text-right">
            Question {step} of {totalQuestions}
          </div>
        </div>

        {/* Question */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer options as cards */}
        <div className="flex flex-col gap-4">
          {currentQuestion.options.map((option) => {
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left rounded-xl border px-5 py-4 font-medium text-base shadow-sm transition-all
                  ${isSelected
                    ? "border-green-500 bg-green-50 text-green-900 ring-2 ring-green-400"
                    : "border-neutral-200 bg-transparent hover:border-green-400 hover:bg-green-50"}
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`flex-1 py-4 rounded-xl font-semibold text-base shadow transition-colors
              bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500`}
          >
            Next
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 py-4 rounded-xl font-semibold text-base shadow border border-neutral-200 bg-white text-black hover:bg-neutral-100"
          >
            Skip to Results
          </button>
        </div>
      </div>
    </main>
  );
} 