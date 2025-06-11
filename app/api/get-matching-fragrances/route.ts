import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received POST to /api/get-matching-fragrances:', body);
    // Return mock data for now
    return NextResponse.json({ results: [] }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/get-matching-fragrances:', error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
} 