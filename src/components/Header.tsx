'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useState } from 'react';

const navItems = [
  { href: '/' as const, key: 'home' },
  { href: '/tools' as const, key: 'tools' },
  { href: '/pricing' as const, key: 'pricing' },
  { href: '/blog' as const, key: 'blog' },
  { href: '/directory' as const, key: 'directory' },
  { href: '/about' as const, key: 'about' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg font-bold text-text-primary">
              Faceless<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
