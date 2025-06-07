'use client';

import { getMatchingFragrances } from '@/lib/airtable';
import Image from 'next/image';
import { insertQuizResponse } from '@/lib/supabase';
import { useEffect, useState } from 'react';

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
}

export default function Results() {
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [tags, setTags] = useState<string[]>(mockTags);

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
      
      // Fetch fragrances
      const fragrances = await getMatchingFragrances(quizTags);
      setFragrances(fragrances);
    };

    fetchData();
  }, []);

  // Insert quiz response into Supabase when fragrances are loaded
  useEffect(() => {
    if (fragrances.length > 0) {
      const quizAnswers = JSON.parse(localStorage.getItem('quiz_answers') || '{}');
      const topFragranceIds = fragrances.slice(0, 3).map(f => f.frag_number);
      
      insertQuizResponse({
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
        top_fragrance_ids: topFragranceIds
      });
    }
  }, [fragrances]);

  return (
    <main className="min-h-screen flex flex-col items-start px-1 pt-4 font-jakarta w-full">
      <h1 className="text-4xl font-semibold mb-2 text-left w-full">Recommended Fragrances</h1>
      <div className="w-full mb-8">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
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
            // Remove or comment out unused variable 'moreInfo'
            // const moreInfo = typeof fields['MoreInfo'] === 'string' ? fields['MoreInfo'] as string : '';
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
                  className={`block w-full bg-gradient-to-b from-neutral-900 to-neutral-800 text-white text-center py-5 rounded-xl font-semibold text-2xl mb-2 shadow-md hover:opacity-90 transition active:scale-95${!purchaseUrl ? ' opacity-50 pointer-events-none' : ''}`}
                  style={{ transition: 'box-shadow, transform 0.15s' }}
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