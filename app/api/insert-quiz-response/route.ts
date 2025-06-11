import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function isLocalIP(ip: string | undefined): boolean {
  if (!ip) return true;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.20.') ||
    ip.startsWith('172.21.') ||
    ip.startsWith('172.22.') ||
    ip.startsWith('172.23.') ||
    ip.startsWith('172.24.') ||
    ip.startsWith('172.25.') ||
    ip.startsWith('172.26.') ||
    ip.startsWith('172.27.') ||
    ip.startsWith('172.28.') ||
    ip.startsWith('172.29.') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  );
}

async function getCountryFromIP(ip: string | undefined): Promise<string> {
  if (!ip || isLocalIP(ip)) {
    console.log('Skipping IP geolocation for local IP:', ip);
    return 'unknown';
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) {
      console.error('ipapi.co fetch failed:', res.status, res.statusText);
      return 'unknown';
    }
    const data = await res.json();
    if (typeof data.country_name === 'string' && data.country_name.trim() !== '') {
      return data.country_name;
    }
    console.error('ipapi.co returned invalid response:', data);
    return 'unknown';
  } catch (err) {
    console.error('Error fetching country from ipapi.co:', err);
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
    console.log('Extracted IP from x-forwarded-for:', ip);
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