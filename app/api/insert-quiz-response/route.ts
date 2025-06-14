import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface GeoLocation {
  country_name: string;
  city: string | null;
  region: string | null;
}

function isLocalIP(ip: string | null): boolean {
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

async function getLocationFromIP(ip: string | null): Promise<GeoLocation> {
  if (!ip || isLocalIP(ip)) {
    console.log('Skipping IP geolocation for local IP:', ip);
    return { country_name: 'unknown', city: null, region: null };
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) {
      console.error('ipapi.co fetch failed:', res.status, res.statusText);
      return { country_name: 'unknown', city: null, region: null };
    }
    const data = await res.json();
    return {
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
  } catch (err) {
    console.error('Error fetching location from ipapi.co:', err);
    return { country_name: 'unknown', city: null, region: null };
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

    // Get IP and location data
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || null;
    console.log('Extracted IP:', ip);

    // Get location data from request body or IP
    let location: GeoLocation;
    if (typeof body.user_country === 'string' && body.user_country.trim() !== '') {
      location = {
        country_name: body.user_country.trim(),
        city: typeof body.user_city === 'string' ? body.user_city.trim() : null,
        region: typeof body.user_region === 'string' ? body.user_region.trim() : null
      };
      console.log('📍 Using location from request body:', location);
    } else {
      location = await getLocationFromIP(ip);
      console.log('📍 Using location from IP:', location);
    }

    // Validate email
    let email: string | null = null;
    if (typeof body.email === 'string' && body.email.trim() !== '') {
      email = body.email.trim();
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const insertData = {
      ...body,
      tags,
      user_country: location.country_name,
      user_city: location.city,
      user_region: location.region,
      email,
    };

    console.log('📝 Inserting quiz response with data:', insertData);

    const { data, error } = await supabase.from('quiz_responses').insert([insertData]).select();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 