"use client";
/**
 * Minna mark — three 人 (person) strokes stacked into 众, the character for "crowd".
 * みんな means everyone, so the mark spells its own name: one learner above, two below,
 * the negative space between them forming a deliberate downward wedge.
 * Monoweight, one accent stroke, legible down to 16px.
 */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Minna"
      fill="none"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* upper 人 — carries the accent, sits just above optical center */}
      <path d="M16 5.6 L10.6 14.4" stroke="var(--primary)" />
      <path d="M16.4 7.6 L21.9 15.6" stroke="var(--primary)" />

      {/* lower pair, tucked under the arms of the first */}
      <path d="M9.4 15.4 L4.6 24.6" stroke="currentColor" />
      <path d="M9.8 17.3 L14.4 25.6" stroke="currentColor" />
      <path d="M22.6 15.4 L17.8 24.6" stroke="currentColor" />
      <path d="M23 17.3 L27.6 25.6" stroke="currentColor" />
    </svg>
  )
}

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-[26px] w-[26px] shrink-0" />
      <span className="headline text-[19px] tracking-[-0.045em]">minna</span>
    </span>
  )
}
