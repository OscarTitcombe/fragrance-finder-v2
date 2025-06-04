import { getMatchingFragrances } from '@/lib/airtable';
import TagPill from '@/components/TagPill';
import { cookies } from 'next/headers';

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

export default async function Results() {
  // Read the quiz_tags cookie
  const cookieStore = await cookies();
  const quizTagsCookie = cookieStore.get('quiz_tags');
  
  // Parse the cookie value or use mock data
  const tags = quizTagsCookie 
    ? JSON.parse(quizTagsCookie.value)
    : mockTags;
  const totalTags = tags.length;

  // Fetch fragrances using the tags
  const fragrances = await getMatchingFragrances(tags);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 pt-20 font-jakarta">
      <h1 className="text-4xl font-semibold mb-6 text-center">Your Fragrance Matches</h1>
      {fragrances.length === 0 ? (
        <p className="text-base text-gray-600 text-center">
          No matches found. Try adjusting your preferences.
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fragrances.map((fragrance, index) => {
            const fields: Record<string, any> = fragrance.fields || {};
            const getRating = (key: string) => {
              const val = fields[key];
              return typeof val === 'number' && !isNaN(val) ? val : 0;
            };
            const relevance = typeof fragrance.relevance === 'number' ? fragrance.relevance : 0;
            const purchaseUrl = fields['link_global'] || '';
            const moreInfo = fields['MoreInfo'] || '';
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 space-y-4 flex flex-col items-stretch relative max-w-md mx-auto">
                {fragrance.image && (
                  <img
                    src={fragrance.image}
                    alt={fragrance.title}
                    className="rounded-md shadow-sm w-full h-48 object-contain mx-auto"
                  />
                )}
                <h2 className="text-lg font-semibold text-center">{fragrance.title}</h2>
                <div className="text-sm text-gray-500 mb-1 text-center">Relevance: {relevance.toFixed(1)}%</div>
                <p className="text-sm text-gray-700 text-center">{fragrance.description}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Longevity:</span> <span>{getRating('Longevity')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Sillage:</span> <span>{getRating('Sillage')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Versatility:</span> <span>{getRating('Versatility')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Uniqueness:</span> <span>{getRating('Uniqueness')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Mass Appeal:</span> <span>{getRating('Mass Appeal')}/10</span></div>
                  <div className="text-sm text-gray-700 flex justify-between"><span className="font-semibold">Value:</span> <span>{getRating('Value')}/10</span></div>
                </div>
                <a
                  href={purchaseUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full bg-gradient-to-b from-neutral-900 to-neutral-800 text-white text-center py-3 rounded-lg font-semibold text-base mb-2 hover:opacity-90 transition${!purchaseUrl ? ' opacity-50 pointer-events-none' : ''}`}
                  tabIndex={purchaseUrl ? 0 : -1}
                  aria-disabled={!purchaseUrl}
                >
                  Purchase Here
                </a>
                <button
                  className="w-full text-center text-sm text-gray-700 py-2 rounded-lg hover:bg-neutral-100 transition mb-1 border border-gray-100"
                  disabled={!moreInfo}
                >
                  More Info
                </button>
                {moreInfo && (
                  <div className="w-full bg-neutral-50 rounded-lg p-3 text-gray-600 text-sm mt-1 shadow-inner">
                    {moreInfo}
                  </div>
                )}
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