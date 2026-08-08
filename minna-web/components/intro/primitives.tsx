"use client";
import type { ReactNode } from 'react'
import { Link } from '@/src/i18n/navigation'
import { useReveal } from './lib/hooks'

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useReveal<HTMLDivElement>(delay)
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] font-medium tracking-[0.22em] uppercase text-primary">{children}</p>
  )
}

export function CTA({
  children,
  href = '#',
  to,
  variant = 'solid',
}: {
  children: ReactNode
  href?: string
  /** Internal route — renders a router Link instead of an anchor. */
  to?: string
  variant?: 'solid' | 'ghost'
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-medium transition-all duration-300 active:scale-[0.97]'
  const styles =
    variant === 'solid'
      ? 'bg-primary text-primary-foreground hover:brightness-110 hover:shadow-[0_8px_30px_-8px_var(--primary)]'
      : 'border border-border text-foreground hover:bg-secondary'
  const className = `${base} ${styles}`

  if (to) {
    return (
      <Link href={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-32px_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  )
}
