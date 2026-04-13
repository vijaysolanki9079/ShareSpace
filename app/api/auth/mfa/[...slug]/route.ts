import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  _context: { params: Promise<{ slug: string[] }> }
) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
