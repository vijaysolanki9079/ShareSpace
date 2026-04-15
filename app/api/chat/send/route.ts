import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase-server';

type Body = { conversation_id: string; encrypted_content: string; nonce: string };

export async function POST(request: NextRequest) {
  try {
    const body: Body = await request.json();
    const { conversation_id, encrypted_content, nonce } = body;
    if (!conversation_id || !encrypted_content || !nonce) {
      return NextResponse.json({ error: 'conversation_id, encrypted_content and nonce are required' }, { status: 400 });
    }

    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Verify membership
    const { data: members, error: memberErr } = await supabaseAdmin
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversation_id)
      .eq('user_id', userId)
      .limit(1);

    if (memberErr) throw memberErr;
    if (!members || members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: msg, error: insertErr } = await supabaseAdmin
      .from('messages')
      .insert([{ conversation_id, sender_id: userId, encrypted_content, nonce }])
      .select()
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, message: msg }, { status: 201 });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error('chat send error', err);
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
