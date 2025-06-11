import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getCountryFromIP(ip: string | undefined): Promise<string> {
  if (!ip) return 'unknown';
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) return 'unknown';
    const data = await res.json();
    if (typeof data.country_name === 'string' && data.country_name.trim() !== '') {
      return data.country_name;
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Flatten and clean tags
    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.flat(Infinity).filter((t: unknown): t is string => typeof t === 'string' && t.trim() !== '');
    }
    // If tags are also in other fields, flatten them in
    const extraTagFields = [
      body.gender,
      body.age_group,
      body.usage,
      body.scent_profile,
      body.intensity,
      body.longevity,
      body.budget,
      body.brand_type,
      ...(Array.isArray(body.seasonality) ? body.seasonality : []),
      ...(Array.isArray(body.avoidance) ? body.avoidance : [])
    ];
    tags = [
      ...tags,
      ...extraTagFields.filter((t: unknown): t is string => typeof t === 'string' && t.trim() !== '')
    ];
    // Remove duplicates
    tags = Array.from(new Set(tags));
    // Detect user_country from IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : undefined;
    let user_country = typeof body.user_country === 'string' && body.user_country.trim() !== ''
      ? body.user_country.trim()
      : undefined;
    if (!user_country) {
      user_country = await getCountryFromIP(ip);
    }
    if (!user_country) user_country = 'unknown';
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    const insertData = {
      ...body,
      tags,
      user_country,
    };
    const { data, error } = await supabase.from('quiz_responses').insert([insertData]).select();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 