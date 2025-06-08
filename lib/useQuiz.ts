import { useState, useCallback } from 'react';
import { quizQuestions } from './quizData';

interface QuizAnswers {
  [key: string]: string | string[];
}

// Helper function to safely access localStorage
const getStoredAnswers = (): QuizAnswers => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('quiz_answers');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {};
  }
};

// Helper function to safely write to localStorage
const setStoredAnswers = (answers: QuizAnswers) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('quiz_answers', JSON.stringify(answers));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export function useQuiz() {
  // Initialize state from localStorage
  const [answers, setAnswers] = useState<QuizAnswers>(getStoredAnswers);

  // Memoize setAnswer to prevent unnecessary re-renders
  const setAnswer = useCallback((id: string, value: string | string[]) => {
    setAnswers(prev => {
      const updated = {
        ...prev,
        [id]: value
      };
      // Update localStorage after state update
      setStoredAnswers(updated);
      return updated;
    });
  }, []);

  // Memoize clearAnswers to prevent unnecessary re-renders
  const clearAnswers = useCallback(() => {
    setAnswers({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz_answers');
    }
  }, []);

  const getCurrentQuestion = (step: number) => {
    // Convert step to 0-based index
    const index = step - 1;
    
    // Return undefined if step is out of bounds
    if (index < 0 || index >= quizQuestions.length) {
      return undefined;
    }

    return quizQuestions[index];
  };

  const getProgress = (step: number) => {
    // Calculate percentage based on current step
    const percentage = (step / quizQuestions.length) * 100;
    return Math.round(percentage);
  };

  return {
    answers,
    setAnswer,
    getCurrentQuestion,
    getProgress,
    clearAnswers,
    totalQuestions: quizQuestions.length
  };
} 