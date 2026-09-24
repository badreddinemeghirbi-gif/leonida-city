'use client';

import dynamic from 'next/dynamic';

/* Both are below-the-fold interactions — never block first paint with them. */
const AskAI = dynamic(() => import('@/components/AskAI'), { ssr: false });
const EmailSignup = dynamic(() => import('@/components/EmailSignup'), { ssr: false });

export default function ClientChrome() {
  return (
    <>
      <EmailSignup />
      <AskAI />
    </>
  );
}
