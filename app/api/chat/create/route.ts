import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import supabaseAdmin from '@/lib/supabase-server';

type Body = { participants: string[]; title?: string };

export async function POST(request: NextRequest) {
  try {
    const body: Body = await request.json();
    const { participants, title } = body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'participants array required' }, { status: 400 });
    }

    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create conversation with service role (admin) client
    const { data: conv, error: convErr } = await supabaseAdmin
      .from('conversations')
      .insert([{ title: title ?? null }])
      .select()
      .single();

    if (convErr) throw convErr;

    const convId = conv.id;
    // ensure the creator is a member, and add provided participants
    const rows = participants
      .filter(Boolean)
      .map((p) => ({ conversation_id: convId, user_id: p }));

    // include creator
    rows.push({ conversation_id: convId, user_id: (session.user as any).id });

    const { error: insertErr } = await supabaseAdmin.from('conversation_members').insert(rows);
    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, conversation: conv }, { status: 201 });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error('create conversation error', err);
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
