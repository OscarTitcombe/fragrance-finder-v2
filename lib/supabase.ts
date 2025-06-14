console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js'

interface GeoLocation {
  country_name: string;
  city: string | null;
  region: string | null;
}

let cachedGeo: GeoLocation | null = null;

export async function getCachedGeo(): Promise<GeoLocation> {
  if (cachedGeo) return cachedGeo;
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    cachedGeo = {
      country_name: typeof data.country_name === 'string' && data.country_name.trim() !== '' 
        ? data.country_name 
        : 'unknown',
      city: typeof data.city === 'string' && data.city.trim() !== '' 
        ? data.city 
        : null,
      region: typeof data.region === 'string' && data.region.trim() !== '' 
        ? data.region 
        : null
    };
    return cachedGeo;
  } catch {
    return { country_name: 'unknown', city: null, region: null };
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function insertQuizResponse(quizAnswers: {
  gender: string
  age_group: string
  usage: string
  scent_profile: string
  intensity: string
  seasonality: string[]
  avoidance: string[]
  longevity: string
  budget: string
  brand_type: string
  top_fragrance_ids: number[]
}) {
  console.log('Attempting to insert quiz response:', quizAnswers);
  
  const alreadySubmitted = localStorage.getItem('quiz_submitted')
  if (alreadySubmitted) {
    console.log('Quiz already submitted, skipping');
    return;
  }

  const geo = await getCachedGeo();
  console.log('User location:', geo);

  const tags = [
    quizAnswers.gender,
    quizAnswers.age_group,
    quizAnswers.usage,
    quizAnswers.scent_profile,
    quizAnswers.intensity,
    quizAnswers.longevity,
    quizAnswers.budget,
    quizAnswers.brand_type,
    ...(quizAnswers.seasonality || []),
    ...(quizAnswers.avoidance || [])
  ]

  console.log('Inserting into Supabase with data:', {
    gender: quizAnswers.gender,
    age_group: quizAnswers.age_group,
    usage: quizAnswers.usage,
    scent_profile: quizAnswers.scent_profile,
    intensity: quizAnswers.intensity,
    seasonality: quizAnswers.seasonality,
    avoidance: quizAnswers.avoidance,
    longevity: quizAnswers.longevity,
    budget: quizAnswers.budget,
    brand_type: quizAnswers.brand_type,
    top_fragrance_ids: quizAnswers.top_fragrance_ids,
    user_country: geo.country_name,
    user_city: geo.city,
    user_region: geo.region,
    tags
  });

  const { data, error } = await supabase.from('quiz_responses').insert([
    {
      gender: quizAnswers.gender,
      age_group: quizAnswers.age_group,
      usage: quizAnswers.usage,
      scent_profile: quizAnswers.scent_profile,
      intensity: quizAnswers.intensity,
      seasonality: quizAnswers.seasonality,
      avoidance: quizAnswers.avoidance,
      longevity: quizAnswers.longevity,
      budget: quizAnswers.budget,
      brand_type: quizAnswers.brand_type,
      top_fragrance_ids: quizAnswers.top_fragrance_ids,
      user_country: geo.country_name,
      user_city: geo.city,
      user_region: geo.region,
      tags
    }
  ]).select()

  if (error) {
    console.error('❌ Failed to insert quiz response:', error)
    return
  }

  // Store the quiz response ID in localStorage
  if (data && data[0]) {
    localStorage.setItem('quiz_response_id', data[0].id)
  }

  localStorage.setItem('quiz_submitted', 'true')
  console.log('✅ Quiz response inserted into Supabase.')
} 