'use client';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: 'td' | 'object-remover' | 'translator';
  used?: number;
  limit?: number;
  plan?: string;
  message?: string;
}

const TOOL_NAMES: Record<string, string> = {
  td: 'TD generations',
  'object-remover': 'object removals',
  translator: 'video translations',
};

export function UpgradeModal({
  isOpen,
  onClose,
  tool,
  used,
  limit,
  plan = 'free',
  message,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const toolName = TOOL_NAMES[tool] ?? tool;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🚀</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {used !== undefined && limit !== undefined
              ? 'Daily limit reached'
              : 'Upgrade required'}
          </h2>
          <p className="text-text-secondary text-sm">
            {message ?? (
              used !== undefined && limit !== undefined
                ? <>
                    You&apos;ve used{' '}
                    <span className="text-text-primary font-semibold">{used}/{limit}</span>{' '}
                    {toolName} today on the{' '}
                    <span className="font-semibold capitalize">{plan}</span> plan.
                  </>
                : <>This feature requires a Pro or Max plan.</>
            )}
          </p>
        </div>

        <div className="bg-background border border-border rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Pro plan includes
          </p>
          <ul className="space-y-2 text-sm">
            <li className="text-text-secondary">
              ✓ <span className="text-text-primary">30 TD generations / day</span>
            </li>
            <li className="text-text-secondary">
              ✓ <span className="text-text-primary">20 object removals / day</span>
            </li>
            <li className="text-text-secondary">
              ✓ <span className="text-text-primary">5 keyword monitors</span>
            </li>
            <li className="text-text-secondary">
              ✓ <span className="text-text-primary">All 20+ translation languages</span>
            </li>
            <li className="text-text-secondary">
              ✓ <span className="text-text-primary">30 videos / batch (translator)</span>
            </li>
          </ul>
        </div>

        <a
          href="/en/pricing"
          className="block w-full text-center bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-6 py-3 transition-colors mb-3"
        >
          Upgrade to Pro — $9/mo
        </a>
        <button
          onClick={onClose}
          className="block w-full text-center text-text-secondary hover:text-text-primary text-sm py-2 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
