'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function NewsletterForm() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with Resend or other email service
    setStatus('success');
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('placeholder')}
        required
        className="flex-1 px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        {t('button')}
      </button>
      {status === 'success' && (
        <p className="text-success text-sm sm:absolute sm:mt-14">Subscribed!</p>
      )}
    </form>
  );
}
