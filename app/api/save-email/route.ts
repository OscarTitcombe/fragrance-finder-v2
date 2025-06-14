import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { quizResponseId, email, agreed_to_lead_terms } = await req.json();

  if (!quizResponseId || !email) {
    return NextResponse.json({ error: 'Missing quizResponseId or email' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { error } = await supabase
    .from('quiz_responses')
    .update({ 
      email,
      agreed_to_lead_terms: agreed_to_lead_terms || false 
    })
    .eq('id', quizResponseId);

  if (error) {
    console.error('Failed to update quiz response:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 