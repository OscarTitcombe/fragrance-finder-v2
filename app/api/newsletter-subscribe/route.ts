import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, geo, quizAnswers, tags } = await req.json();
    console.log('📧 Newsletter subscription request:', { email, geo, quizAnswers, tags });
    
    if (!email) {
      console.error('❌ Missing email in newsletter subscription');
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    
    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    console.log('📧 Inserting into newsletter_subscribers table...');
    console.log('📧 Data to insert:', {
      email,
      user_country: geo?.country_name || 'unknown',
      user_city: geo?.city || null,
      user_region: geo?.region || null,
      quiz_answers: quizAnswers || null,
      tags: tags || null,
    });
    
    // Simple insert - let Supabase handle duplicates if any
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email,
        user_country: geo?.country_name || 'unknown',
        user_city: geo?.city || null,
        user_region: geo?.region || null,
        quiz_answers: quizAnswers || null,
        tags: tags || null,
      }])
      .select();
    
    if (error) {
      console.error('❌ Newsletter subscription error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Newsletter subscription successful:', data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('❌ Newsletter subscription unexpected error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 