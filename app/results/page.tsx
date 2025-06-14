'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import EmailCollectionPopup from '@/components/EmailCollectionPopup';

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
  link_global?: string;
  [key: string]: unknown;
}

export interface Fragrance {
  id: string;
  frag_number: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  matchCount: number;
  avgScore: number;
  fields: FragranceFields;
  score: number;
  relevance: number;
  displayMatch: number;
}

interface GeoLocation {
  country_name: string;
  city: string | null;
  region: string | null;
}

const disclosureText = 'We may earn a commission when you click links and make purchases. As an affiliate, we only recommend products we believe in. This helps support our work, at no extra cost to you.';

export default function Results() {
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [tags, setTags] = useState<string[]>(mockTags);
  const [loading, setLoading] = useState(true);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [quizUuid, setQuizUuid] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoLocation | null>(null);

  // Fetch geolocation on mount
  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        console.log('🌍 Fetched geolocation:', data);
        setGeo({
          country_name: data.country_name || 'unknown',
          city: data.city || null,
          region: data.region || null,
        });
      } catch (err) {
        console.warn('❌ IP geo fetch failed:', err);
        setGeo({ country_name: 'unknown', city: null, region: null });
      }
    };
    fetchGeo();
  }, []);

  // Fetch fragrances on mount
  useEffect(() => {
    const fetchData = async () => {
      // Get tags from cookie
      const cookies = document.cookie.split(';');
      const quizTagsCookie = cookies.find(c => c.trim().startsWith('quiz_tags='));
      const quizTags = quizTagsCookie 
        ? JSON.parse(decodeURIComponent(quizTagsCookie.split('=')[1]))
        : mockTags;
      setTags(quizTags);

      try {
        // Fetch fragrances
        const response = await fetch('/api/get-matching-fragrances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tags: quizTags })
        });
        let data;
        try {
          data = await response.json();
        } catch {
          data = {};
        }
        const results = Array.isArray(data.results) ? data.results : [];
        setFragrances(results);

        // Insert quiz response into Supabase
        console.log('Fragrances loaded:', results);
        const quizAnswers = JSON.parse(localStorage.getItem('quiz_answers') || '{}');
        console.log('Quiz answers from localStorage:', quizAnswers);
        const topFragranceIds = results.slice(0, 3).map((f: { frag_number: string | number }) => {
          // Extract number from "frag_89" format and convert to integer
          const fragNumber = parseInt(f.frag_number.toString().replace('frag_', ''));
          console.log('Converting frag_number:', f.frag_number, 'to:', fragNumber);
          return fragNumber;
        });
        console.log('Top fragrance IDs:', topFragranceIds);

        const quizResponse = await fetch('/api/insert-quiz-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gender: quizAnswers.gender || '',
            age_group: quizAnswers.age || '',
            usage: quizAnswers.usage || '',
            scent_profile: quizAnswers.profile || '',
            intensity: quizAnswers.intensity || '',
            seasonality: [quizAnswers.season || ''],
            avoidance: quizAnswers.avoid ? [quizAnswers.avoid] : [],
            longevity: quizAnswers.longevity || '',
            budget: quizAnswers.budget || '',
            brand_type: quizAnswers.brand || '',
            top_fragrance_ids: topFragranceIds,
            user_country: geo?.country_name ?? 'unknown',
            user_city: geo?.city ?? null,
            user_region: geo?.region ?? null
          })
        });

        if (!quizResponse.ok) {
          throw new Error('Failed to save quiz response');
        }

        const quizData = await quizResponse.json();
        if (quizData.data && quizData.data[0] && quizData.data[0].id) {
          const uuid = quizData.data[0].id;
          console.log('✅ Quiz inserted, UUID:', uuid);
          setQuizUuid(uuid);
          
          // Only show email popup after quiz response is saved and UUID is set
          const emailCollected = localStorage.getItem('email_collected');
          if (!emailCollected) {
            setShowEmailPopup(true);
          }
        } else {
          console.error('❌ No UUID returned from quiz response');
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [geo]); // Add geo as a dependency to re-run when geolocation is available

  return (
    <main className="min-h-screen flex flex-col items-start px-1 pt-4 font-jakarta w-full">
      {showEmailPopup && quizUuid && (
        <EmailCollectionPopup quizUuid={quizUuid} fragrances={fragrances} tags={tags} />
      )}
      <div className="w-full flex justify-between items-start mb-2">
        <h1 className="text-4xl font-semibold text-left">Recommended Fragrances</h1>
        <div className="relative group">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-help">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div className="absolute right-0 top-8 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 hidden group-hover:block z-50">
            {disclosureText}
          </div>
        </div>
      </div>
      <div className="w-full mb-8">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <div className="font-semibold text-lg mb-1">Your Fragrance Profile</div>
          <div className="text-gray-600 text-base">
            {`Profile: ${tags.map(tag => tag.replace(/-/g, ' ')).join(', ')}`}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 space-y-5 flex flex-col items-stretch relative max-w-md mx-auto border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-2 w-full">
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 rounded-full bg-gray-200" />
              </div>
              <div className="flex justify-center mb-2">
                <div className="w-[260px] h-[260px] bg-gray-200 rounded-md" />
              </div>
              <div className="h-7 w-3/4 bg-gray-200 rounded mb-1" />
              <div className="h-5 w-full bg-gray-200 rounded mb-2" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 w-24 bg-gray-200 rounded" />
                ))}
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : !Array.isArray(fragrances) || fragrances.length === 0 ? (
        <p className="text-base text-gray-600 text-center">
          No recommendations found.
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fragrances.map((fragrance, index) => {
            const fields = fragrance.fields;
            const getRating = (key: string) => {
              const val = fields[key];
              return typeof val === 'number' && !isNaN(val) ? val : 0;
            };
            const displayMatch = typeof fragrance.displayMatch === 'number' ? fragrance.displayMatch : 0;
            const purchaseUrl = typeof fields['link_global'] === 'string' ? fields['link_global'] as string : '';
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 space-y-5 flex flex-col items-stretch relative max-w-md mx-auto border border-gray-100">
                <div className="flex items-center justify-between mb-2 w-full">
                  <div className="text-lg text-gray-700 font-bold text-left">Match: {displayMatch}%</div>
                  <div className="relative group ml-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-help">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                    </div>
                    <div className="absolute right-0 top-8 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 hidden group-hover:block z-50">
                      {disclosureText}
                    </div>
                  </div>
                </div>
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
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-2">
                  <div className="text-xs sm:text-sm text-gray-700 flex justify-between"><span className="font-semibold">Longevity:</span> <span className="font-bold">{getRating('Longevity')}/10</span></div>
                  <div className="text-xs sm:text-sm text-gray-700 flex justify-between"><span className="font-semibold">Projection:</span> <span className="font-bold">{getRating('Sillage')}/10</span></div>
                  <div className="text-xs sm:text-sm text-gray-700 flex justify-between"><span className="font-semibold">Versatility:</span> <span className="font-bold">{getRating('Versatility')}/10</span></div>
                  <div className="text-xs sm:text-sm text-gray-700 flex justify-between"><span className="font-semibold">Uniqueness:</span> <span className="font-bold">{getRating('Uniqueness')}/10</span></div>
                  <div className="text-xs sm:text-sm text-gray-700 flex justify-between"><span className="font-semibold">Value:</span> <span className="font-bold">{getRating('Value')}/10</span></div>
                  <div className="text-xs sm:text-sm text-gray-700 flex justify-between"><span className="font-semibold">Mass Appeal:</span> <span className="font-bold">{getRating('Mass Appeal')}/10</span></div>
                </div>
                <a
                  href={purchaseUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('best_prices_click', { fragrance: fragrance.title, id: fragrance.frag_number })}
                  className={`block w-full bg-gradient-to-b from-neutral-900 to-neutral-800 text-white text-center py-5 rounded-xl font-semibold text-2xl mb-2 shadow-md hover:opacity-90 transition active:scale-95${!purchaseUrl ? ' opacity-50 pointer-events-none' : ''}`}
                  style={{ transition: 'box-shadow, transform 0.15s' }}
                  tabIndex={purchaseUrl ? 0 : -1}
                  aria-disabled={!purchaseUrl}
                >
                  Best Prices Here
                </a>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
} 