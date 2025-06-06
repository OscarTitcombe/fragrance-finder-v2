import { getMatchingFragrances } from '@/lib/airtable';
import { cookies } from 'next/headers';
import Image from 'next/image';

// Fallback mock tags if no cookie is present
const mockTags = [
  'for-men',
  'daily-wear',
  'fresh-citrus',
  'warm-weather',
  'moderate-intensity',
  'medium-longevity',
  'budget-mid',
  'designer-brand'
];

interface FragranceFields {
  Longevity?: number;
  Sillage?: number;
  Versatility?: number;
  Uniqueness?: number;
  MassAppeal?: number;
  Value?: number;
  [key: string]: unknown;
}

interface Fragrance {
  title: string;
  description: string;
  tags: string[];
  image: string;
  matchCount: number;
  avgScore: number;
  fields: FragranceFields;
  score: number;
  relevance: number;
}

export default async function Results() {
  // Read the quiz_tags cookie
  const cookieStore = await cookies();
  const quizTagsCookie = cookieStore.get('quiz_tags');
  
  // Parse the cookie value or use mock data
  const tags: string[] = quizTagsCookie 
    ? JSON.parse(quizTagsCookie.value)
    : mockTags;

  // Fetch fragrances using the tags
  const fragrances: Fragrance[] = await getMatchingFragrances(tags);

  return (
    <main className="min-h-screen flex flex-col items-start px-4 pt-20 font-jakarta w-full">
      <h1 className="text-4xl font-semibold mb-2 text-left w-full">Recommended Fragrances</h1>
      <div className="w-full mb-8">
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4">
          <div className="font-semibold text-lg mb-1">Your Fragrance Profile</div>
          <div className="text-gray-600 text-base">
            {`Profile: ${tags.map(tag => tag.replace(/-/g, ' ')).join(', ')}`}
          </div>
        </div>
      </div>
      {fragrances.length === 0 ? (
        <p className="text-base text-gray-600 text-center">
          No matches found. Try adjusting your preferences.
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fragrances.map((fragrance, index) => {
            const fields = fragrance.fields;
            const getRating = (key: string) => {
              const val = fields[key];
              return typeof val === 'number' && !isNaN(val) ? val : 0;
            };
            const relevance = typeof fragrance.relevance === 'number' ? fragrance.relevance : 0;
            const purchaseUrl = typeof fields['link_global'] === 'string' ? fields['link_global'] as string : '';
            const moreInfo = typeof fields['MoreInfo'] === 'string' ? fields['MoreInfo'] as string : '';
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 space-y-5 flex flex-col items-stretch relative max-w-md mx-auto border border-gray-100">
                <div className="text-lg text-gray-700 font-bold text-left mb-2">Match: {relevance.toFixed(1)}%</div>
                {fragrance.image && (
                  <div className="flex justify-center mb-2">
                    <Image
                      src={fragrance.image}
                      alt={fragrance.title}
                      width={260}
                      height={260}
                      className="rounded-md object-contain"
                      style={{ width: '260px', height: '260px', boxShadow: 'none' }}
                      priority={index < 3}
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-left text-neutral-900 mb-1">{fragrance.title}</h2>
                <p className="text-base text-gray-700 text-left font-normal mb-2">{fragrance.description}</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full mt-2">
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Longevity:</span> <span className="font-bold">{getRating('Longevity')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Projection:</span> <span className="font-bold">{getRating('Sillage')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Versatility:</span> <span className="font-bold">{getRating('Versatility')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Uniqueness:</span> <span className="font-bold">{getRating('Uniqueness')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Value:</span> <span className="font-bold">{getRating('Value')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Mass Appeal:</span> <span className="font-bold">{getRating('Mass Appeal')}/10</span></div>
                </div>
                <a
                  href={purchaseUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full bg-gradient-to-b from-neutral-900 to-neutral-800 text-white text-center py-5 rounded-xl font-semibold text-2xl mb-2 shadow-md hover:opacity-90 transition${!purchaseUrl ? ' opacity-50 pointer-events-none' : ''}`}
                  tabIndex={purchaseUrl ? 0 : -1}
                  aria-disabled={!purchaseUrl}
                >
                  Best Prices Here
                </a>
                {/* Match stats overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
} 