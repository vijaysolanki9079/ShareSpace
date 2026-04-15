import ConversationList from '@/components/chat/ConversationList';

export default function Page() {
  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
        <header className="p-4 border-b border-white/6">
          <h1 className="text-2xl font-semibold">Conversations</h1>
        </header>

        <section>
          <ConversationList />
        </section>
      </div>
    </main>
  );
}
