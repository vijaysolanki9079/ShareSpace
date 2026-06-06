import ChatWindow from '@/components/chat/ChatWindow';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ conversation?: string; ngo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const conversationId = resolvedSearchParams?.conversation ?? null;

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto h-[80vh] bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
        <header className="p-4 border-b border-white/6">
          <h1 className="text-2xl font-semibold">Messages</h1>
        </header>

        <section className="h-full">
          <ChatWindow conversationId={conversationId} />
        </section>
      </div>
    </main>
  );
}
