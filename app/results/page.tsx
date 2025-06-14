'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import EmailCollectionPopup from '@/components/EmailCollectionPopup';
import { mockTags } from '@/lib/mockData';

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
  displayMatch: number;
}

interface GeoLocation {
  country_name: string;
  city: string;
  region: string;
}

const disclosureText = 'We may earn a commission when you click links and make purchases. As an affiliate, we only recommend products we believe in. This helps support our work, at no extra cost to you.';

interface Tag {
  name: string;
}

export default function Results() {
  const [fragrances, setFragrances] = useState<Fragrance[]>([]);
  const [tags, setTags] = useState<Tag[]>(mockTags.map(tag => ({ name: tag })));
  const [loading, setLoading] = useState(true);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [quizUuid, setQuizUuid] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoLocation | null>(null);

  // Fetch geolocation on mount
  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        console.log('🌍 Fetched geolocation data:', data);
        setGeo({
          country_name: data.country_name || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
        });
      } catch (error) {
        console.error('Error fetching geolocation:', error);
        setGeo({
          country_name: 'Unknown',
          city: 'Unknown',
          region: 'Unknown',
        });
      }
    };
    fetchGeo();
  }, []);

  useEffect(() => {
    const fetchFragrances = async () => {
      try {
        setLoading(true);
        const quizTagsCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('quizTags='));

        const quizTags = quizTagsCookie
          ? JSON.parse(decodeURIComponent(quizTagsCookie.split('=')[1]))
          : mockTags;
        setTags(quizTags.map((tag: string) => ({ name: tag })));

        try {
          const response = await fetch('/api/get-fragrances', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tags: quizTags }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch fragrances');
          }

          const data = await response.json();
          console.log('📦 Fetched fragrances:', data);
          setFragrances(data);

          // Get quiz UUID from response
          if (data.quizUuid) {
            setQuizUuid(data.quizUuid);
            // Show email popup if we have a UUID
            setShowEmailPopup(true);
          }
        } catch (error) {
          console.error('Error fetching fragrances:', error);
          setFragrances([]);
        }
      } catch (error) {
        console.error('Error parsing quiz tags:', error);
        setTags(mockTags.map(tag => ({ name: tag })));
      } finally {
        setLoading(false);
      }
    };

    fetchFragrances();
  }, [geo]);

  const handleEmailSubmit = async (email: string) => {
    if (!quizUuid) {
      console.error('No quiz UUID available');
      return;
    }

    try {
      const response = await fetch('/api/save-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizResponseId: quizUuid,
          email,
          agreed_to_lead_terms: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save email');
      }

      console.log('✅ Email saved successfully');
      setShowEmailPopup(false);
    } catch (error) {
      console.error('Error saving email:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Your Personalized Fragrance Matches
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your preferences, we've selected these fragrances that we think you'll love.
            Each one has been carefully chosen to match your unique style and personality.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="font-semibold text-lg mb-1">Your Fragrance Profile</div>
          <div className="text-gray-600 text-base">
            {`Profile: ${tags.map(tag => tag.name.replace(/-/g, ' ')).join(', ')}`}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fragrances.map((fragrance, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <Image
                  src={fragrance.image}
                  alt={fragrance.title}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover"
                  priority={index < 3}
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium">
                  {fragrance.displayMatch}% Match
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{fragrance.title}</h3>
                <p className="text-gray-600 mb-4">{fragrance.description}</p>
                {fragrance.fields.link_global && (
                  <a
                    href={fragrance.fields.link_global}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 transition-colors"
                  >
                    Shop Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {showEmailPopup && (
          <EmailCollectionPopup
            onSuccess={handleEmailSubmit}
            fragrances={fragrances}
            tags={tags}
            quizUuid={quizUuid || ''}
          />
        )}
      </div>
    </div>
  );
} 