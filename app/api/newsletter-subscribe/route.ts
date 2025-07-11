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
    
    // Note: This API handles newsletter subscriptions separately from quiz responses.
    // The quiz_responses table stores the quiz data and email via save-email API.
    // This newsletter_subscribers table is specifically for newsletter subscriptions.
    // A user can be in both tables with the same email.
    
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
      geo: geo || null,
      quiz_answers: quizAnswers || null,
      tags: tags || null,
    });
    
    // First, check if this email already exists in newsletter_subscribers
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existingSubscriber) {
      console.log('📧 Email already exists in newsletter_subscribers, updating with new data');
      // Update existing record with new data
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          geo: geo || existingSubscriber.geo,
          quiz_answers: quizAnswers || existingSubscriber.quiz_answers,
          tags: tags || existingSubscriber.tags,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();
      
      if (error) {
        console.error('❌ Newsletter subscription update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log('✅ Newsletter subscription updated:', data);
      return NextResponse.json({ success: true, data, updated: true }, { status: 200 });
    } else {
      console.log('📧 Inserting new newsletter subscriber');
      // Insert new record
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email,
          geo: geo || null,
          quiz_answers: quizAnswers || null,
          tags: tags || null,
        }])
        .select();
      
      if (error) {
        console.error('❌ Newsletter subscription insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log('✅ Newsletter subscription inserted:', data);
      return NextResponse.json({ success: true, data, inserted: true }, { status: 200 });
    }
  } catch (err) {
    console.error('❌ Newsletter subscription unexpected error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 