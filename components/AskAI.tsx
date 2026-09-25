'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getRicoReply, replyDelay } from '@/lib/rico';

const GREETING =
  "Name's Rico. Been in Leonida since before the neon. Ask me about any spot on that map — or anything else you figure I'd know.";

export default function AskAI() {
  const showChat = useStore((s) => s.showChat);
  const setShowChat = useStore((s) => s.setShowChat);
  const messages = useStore((s) => s.messages);
  const pushMessage = useStore((s) => s.pushMessage);
  const clearChat = useStore((s) => s.clearChat);
  const chatPrefill = useStore((s) => s.chatPrefill);
  const consumePrefill = useStore((s) => s.consumePrefill);
  const hasHydrated = useStore((s) => s.hasHydrated);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Keep the latest message in view */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, showChat]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    pushMessage('user', trimmed);
    setInput('');
    setTyping(true);

    const reply = getRicoReply(trimmed);
    setTimeout(() => {
      pushMessage('ai', reply);
      setTyping(false);
    }, replyDelay(reply));
  };

  /* "Ask AI about [Location]" from the detail panel lands here */
  useEffect(() => {
    if (!showChat || !chatPrefill) return;
    const q = consumePrefill();
    if (q) send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChat, chatPrefill]);

  return (
    <>
      {/* ---------- FLOATING BUTTON ---------- */}
      <AnimatePresence>
        {!showChat && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowChat(true)}
            aria-label="Ask Rico"
            className="chat-fab animate-breathe fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-2xl sm:right-6"
            style={{ background: 'var(--pink)', color: '#000' }}
          >
            💬
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---------- PANEL ---------- */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="glass fixed inset-0 z-50 flex flex-col sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[540px] sm:w-[400px] sm:rounded-xl"
            style={{ border: '2px solid var(--cyan)', boxShadow: '0 0 28px rgba(0,255,255,0.35)' }}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="font-display neon-text-cyan text-sm font-bold">Rico</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Vice City local
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearChat}
                  className="text-[10px] uppercase tracking-wider text-white/40 transition hover:text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  aria-label="Close chat"
                  className="text-white/50 transition hover:text-white"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {hasHydrated && messages.length === 0 && (
                <div className="max-w-[85%] rounded-lg border border-[var(--cyan)]/40 bg-black/60 px-3 py-2 text-sm leading-relaxed text-[var(--muted)]">
                  {GREETING}
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-auto bg-[var(--pink)] font-medium text-black'
                      : 'border border-[var(--cyan)]/40 bg-black/60 text-[var(--muted)]'
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {typing && (
                <div className="max-w-[85%] rounded-lg border border-[var(--cyan)]/40 bg-black/60 px-3 py-2">
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder="Ask Rico anything…"
                className="flex-1 rounded-md border border-white/15 bg-black/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--cyan)]"
              />
              <button
                onClick={() => send(input)}
                disabled={typing || !input.trim()}
                className="btn-primary rounded-md px-4 py-2.5 text-xs disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
