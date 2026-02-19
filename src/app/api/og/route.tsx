import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CATEGORY_COLORS: Record<string, { from: string; to: string; badge: string; text: string }> = {
  Strategy:     { from: '#312e81', to: '#1e3a8a', badge: '#6366f1', text: '#c7d2fe' },
  Growth:       { from: '#064e3b', to: '#134e4a', badge: '#10b981', text: '#a7f3d0' },
  Monetization: { from: '#451a03', to: '#431407', badge: '#f59e0b', text: '#fde68a' },
  Tools:        { from: '#2e1065', to: '#3b0764', badge: '#8b5cf6', text: '#ddd6fe' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Strategy: '🎯',
  Growth: '📈',
  Monetization: '💰',
  Tools: '🛠️',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'FacelessHub Blog';
  const category = searchParams.get('category') ?? 'General';

  const colors = CATEGORY_COLORS[category] ?? {
    from: '#0f172a',
    to: '#1e293b',
    badge: '#6366f1',
    text: '#c7d2fe',
  };
  const icon = CATEGORY_ICONS[category] ?? '📝';

  // Truncate long titles for the image
  const displayTitle = title.length > 72 ? title.slice(0, 69) + '…' : title;

  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 70px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: `linear-gradient(90deg, ${colors.badge}, #a78bfa, ${colors.badge})`,
          }}
        />

        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Site branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: 'auto',
            position: 'relative',
          }}
        >
          <span
            style={{
              color: colors.badge,
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            FacelessHub
          </span>
        </div>

        {/* Icon + Category */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: '42px', lineHeight: 1 }}>{icon}</span>
          <span
            style={{
              background: `${colors.badge}33`,
              color: colors.text,
              fontSize: '15px',
              fontWeight: 600,
              padding: '5px 18px',
              borderRadius: '20px',
              border: `1px solid ${colors.badge}66`,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: '#f1f5f9',
            fontSize: displayTitle.length > 50 ? '44px' : '52px',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '48px',
            maxWidth: '950px',
            position: 'relative',
          }}
        >
          {displayTitle}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <span
            style={{
              color: 'rgba(148,163,184,0.7)',
              fontSize: '15px',
            }}
          >
            facelesschannel.net
          </span>
          <span
            style={{
              color: 'rgba(148,163,184,0.5)',
              fontSize: '14px',
            }}
          >
            Build a Faceless Channel That Makes Money
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
