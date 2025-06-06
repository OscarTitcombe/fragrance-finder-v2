import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[100svh] flex flex-col justify-center items-center px-4 font-jakarta">
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-semibold text-slate-900 text-center">Fragrance Finder</h1>
        <p className="text-base text-gray-600 text-center">Answer 10 quick questions to find your perfect fragrance match.</p>
        <Link href="/quiz/1">
          <button className="bg-gradient-to-b from-neutral-900 to-neutral-800 text-white px-8 py-5 rounded-lg shadow-md hover:opacity-90 transition text-2xl font-semibold w-full max-w-full">
            Begin
          </button>
        </Link>
      </div>
    </main>
  );
}
