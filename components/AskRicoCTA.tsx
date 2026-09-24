'use client';

import { useStore } from '@/store/useStore';

const SUGGESTIONS = (name: string) => [
  `Tell me about ${name}`,
  `Is ${name} dangerous?`,
  `How do I make money in ${name}?`,
];

export default function AskRicoCTA({
  name,
  accent,
}: {
  name: string;
  accent: string;
}) {
  const setShowChat = useStore((s) => s.setShowChat);
  const askAbout = useStore((s) => s.askAbout);
  const pushMessage = useStore((s) => s.pushMessage);

  const askCustom = (q: string) => {
    setShowChat(true);
    // Reuse the store's prefill path so AskAI handles the reply
    useStore.setState({ chatPrefill: q });
    void pushMessage;
  };

  return (
    <section
      className="mt-14 rounded-xl border p-6"
      style={{ borderColor: `${accent}55`, boxShadow: `0 0 24px ${accent}22` }}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">💬</span>
        <div className="flex-1">
          <h2 className="font-display text-lg text-white">Ask Rico about {name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Rico&apos;s been in Leonida longer than he&apos;ll admit. Ask him
            anything about this district — or pick one of these.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SUGGESTIONS(name).map((q) => (
              <button
                key={q}
                onClick={() => askCustom(q)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/65 transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
              >
                {q}
              </button>
            ))}
          </div>

          <button
            onClick={() => askAbout(name)}
            className="btn-primary mt-5 rounded-md px-5 py-2.5 text-xs"
          >
            Open chat
          </button>
        </div>
      </div>
    </section>
  );
}
