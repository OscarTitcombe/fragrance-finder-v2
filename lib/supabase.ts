'use client';

import { createClient } from '@supabase/supabase-js'

// Debug logging for environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getCountryFromIP(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    return data.country_name || null
  } catch {
    return null
  }
}

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

  const user_country = await getCountryFromIP()
  console.log('User country:', user_country);

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
    user_country,
    tags
  });

  const { error } = await supabase.from('quiz_responses').insert([
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
      user_country,
      tags
    }
  ])

  if (error) {
    console.error('❌ Failed to insert quiz response:', error)
    return
  }

  localStorage.setItem('quiz_submitted', 'true')
  console.log('✅ Quiz response inserted into Supabase.')
} 