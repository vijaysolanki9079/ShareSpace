import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const BAD_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'damn'];

function sanitize(text: string) {
  const pattern = new RegExp(BAD_WORDS.join('|'), 'gi');
  return text.replace(pattern, (m) => '*'.repeat(m.length));
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text } = await request.json();
    if (typeof text !== 'string') return NextResponse.json({ error: 'text required' }, { status: 400 });

    const clean = sanitize(text);
    return NextResponse.json({ text: clean });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error('profanity check error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
