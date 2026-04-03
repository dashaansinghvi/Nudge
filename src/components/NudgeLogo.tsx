import React from 'react';

interface NudgeLogoProps {
  /** Show just the icon mark */
  iconOnly?: boolean;
  /** Show the tagline below */
  showTagline?: boolean;
  /** Width of the icon (height scales proportionally) */
  iconSize?: number;
  /** Extra CSS class on the wrapper */
  className?: string;
  /** Text size for the wordmark, e.g. 'text-2xl' */
  textSize?: string;
}

/**
 * Nudgé brand logo:
 *  - Gradient N mark with bar-chart bars and upward arrow
 *  - "Nudgé" wordmark in white bold
 *  - Optional tagline "SMARTER FINANCIAL DECISIONS, ONE NUDGE AT A TIME."
 */
export default function NudgeLogo({
  iconOnly = false,
  showTagline = false,
  iconSize = 48,
  className = '',
  textSize = 'text-2xl',
}: NudgeLogoProps) {
  const id = React.useId().replace(/:/g, '-');

  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      <div className="flex items-center gap-3">
        {/* ── Icon mark ── */}
        <svg
          width={iconSize}
          height={(iconSize * 0.85)}
          viewBox="0 0 100 85"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Nudge logo icon"
        >
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0061ff" />
              <stop offset="100%" stopColor="#00e599" />
            </linearGradient>
          </defs>

          {/* Bar chart bars (left side of N) */}
          <rect x="5"  y="55" width="6" height="15" rx="3" fill={`url(#${id}-grad)`} opacity="0.6" />
          <rect x="15" y="45" width="6" height="25" rx="3" fill={`url(#${id}-grad)`} opacity="0.8" />
          <rect x="25" y="35" width="6" height="35" rx="3" fill={`url(#${id}-grad)`} />

          {/* N letterform with integrated arrow */}
          <path
            d="M40 70V25C40 18 45 15 52 18L75 60C80 68 88 68 92 60V20"
            stroke={`url(#${id}-grad)`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Arrow Tip */}
          <path
            d="M85 28L92 20L99 28"
            stroke={`url(#${id}-grad)`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* ── Wordmark ── */}
        {!iconOnly && (
          <span
            className={`font-bold tracking-tight text-white flex items-center gap-0.5 ${textSize}`}
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif", letterSpacing: '-0.02em' }}
          >
            <span>Nudg</span>
            <span className="relative inline-block">
              e
              <svg
                className="absolute -top-1 -right-1 w-3 h-3 text-[#00e599]"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C12 2 12 10 2 12C2 12 10 12 12 22C12 22 12 14 22 12C22 12 14 12 12 2Z" />
              </svg>
            </span>
          </span>
        )}
      </div>

      {/* ── Tagline ── */}
      {showTagline && (
        <p className="nudge-tagline mt-2 text-center text-[10px] tracking-[0.15em] font-bold text-[#00e599] uppercase">
          SMARTER FINANCIAL DECISIONS, ONE NUDGE AT A TIME.
        </p>
      )}
    </div>
  );
}
