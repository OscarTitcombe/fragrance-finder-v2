export default function QuizIntro() {
  return (
    <main className="min-h-[100svh] flex flex-col justify-center items-center font-jakarta">
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
        <h1 className="text-4xl font-bold mb-2 text-center">Fragrance Quiz</h1>
        <p className="text-lg text-gray-600 mb-4 text-center">
          Answer a few questions to help us understand your preferences and find your perfect scent.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full text-lg font-semibold">
          Start Quiz
        </button>
      </div>
    </main>
  );
} 