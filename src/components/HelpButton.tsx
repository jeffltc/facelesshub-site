"use client";

import { useState } from "react";
import { Mail, X, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";

const SUPPORT_EMAIL = "support@facelesschannel.net";

export function HelpButton() {
  const t = useTranslations("help");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {open && (
        <div className="w-72 rounded-2xl border border-border bg-surface shadow-xl">
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm text-text-primary">{t("panel_title")}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pb-4 space-y-3">
            <p className="text-sm text-text-secondary">{t("panel_desc")}</p>

            <div className="rounded-lg bg-surface-hover p-3 space-y-2">
              <p className="text-xs text-text-secondary">{t("email_label")}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary select-all break-all">
                  {SUPPORT_EMAIL}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-md p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label={t("copy_button")}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              {t("send_button")}
            </a>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("panel_title")}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          open
            ? "bg-surface-hover text-text-primary"
            : "bg-primary text-white hover:opacity-90"
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
      </button>
    </div>
  );
}
