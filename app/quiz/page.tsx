export default function QuizIntro() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-6">Fragrance Quiz</h1>
      <p className="text-lg text-gray-600 mb-8">
        Answer a few questions to help us understand your preferences and find your perfect scent.
      </p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Start Quiz
      </button>
    </main>
  );
} 