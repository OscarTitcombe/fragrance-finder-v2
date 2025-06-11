import { NextRequest, NextResponse } from 'next/server';
import { sendQuizResultsEmail } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  const { to, fragrances, tags } = await req.json();

  if (!to || !fragrances || !tags) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sendQuizResultsEmail({ to, fragrances, tags });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending quiz results email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 