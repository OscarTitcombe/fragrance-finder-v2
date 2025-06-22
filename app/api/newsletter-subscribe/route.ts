import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, geo, quizAnswers, tags } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    // Use upsert to prevent duplicate emails
    const { data, error } = await supabase.from('newsletter_subscribers').upsert([
      {
        email,
        geo: geo || null,
        quiz_answers: quizAnswers || null,
        tags: tags || null,
      }
    ], {
      onConflict: 'email', // Assuming 'email' is the unique constraint
      ignoreDuplicates: true // This will ignore duplicates instead of updating
    }).select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 