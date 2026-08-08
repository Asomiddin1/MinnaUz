"use client"

import { useEffect, useState } from 'react'
import { Link } from '@/src/i18n/navigation'
import { useTheme } from 'next-themes'
import LanguageSwitcher from './LanguageSwitcher'
import Image from 'next/image'

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [lifted, setLifted] = useState(false)

  const links = [
    { label: 'Darajalar', href: '#levels' },
    { label: 'Mashqlar', href: '#practice' },
    { label: 'Bolalar uchun', href: '#kids' },
    { label: 'Premium', href: '#premium' },
    { label: 'Maktablar', href: '#schools' },
  ]

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setLifted(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // Prevent hydration mismatch by rendering a consistent initial state
  if (!mounted) {
    return (
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          backgroundColor: 'transparent',
          borderBottom: '1px solid transparent',
        }}
      >
        <nav className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5">
          <Link href="/" aria-label="Minna" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="Logo" width={35} height={35} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-foreground ">MinnaUz</span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href as any}
                  className="text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            {/* Placeholder for theme toggle - same dimensions */}
            <div className="h-9 w-9 rounded-full border border-border" />
            
            <Link
              href="/auth/login"
              className="hidden rounded-full bg-foreground px-4 py-1.5 text-[13px] font-medium text-background transition-opacity duration-300 hover:opacity-85 sm:inline-block"
            >
              Boshlash
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full border border-border md:hidden"
            >
              <span className="text-[14px] leading-none">☰</span>
            </button>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        lifted ? 'backdrop-blur-2xl' : ''
      }`}
      style={{
        backgroundColor: lifted ? 'var(--glass)' : 'transparent',
        borderBottom: lifted ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <nav className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5">
        <Link href="/" aria-label="Minna" className="flex items-center gap-2 group">
          <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
            <Image src="/logo.png" alt="MinnaUz Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">MinnaUz</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href as any}
                className="text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground font-medium"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors duration-300 hover:bg-secondary"
          >
            <span className="text-[14px] leading-none">{theme === 'dark' ? '☾' : '☀'}</span>
          </button>
          
          <Link
            href="/auth/login"
            className="hidden rounded-full bg-foreground px-4 py-1.5 text-[13px] font-medium text-background transition-opacity duration-300 hover:opacity-85 sm:inline-block"
          >
            Boshlash
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-border md:hidden"
          >
            <span className="text-[14px] leading-none">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>

      {open && (
        <ul className="grid gap-1 border-t border-border bg-glass px-5 pb-5 pt-3 backdrop-blur-2xl md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href as any}
                onClick={() => setOpen(false)}
                className="block py-2 text-[17px] text-foreground font-medium"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-foreground px-4 py-2.5 text-center text-[15px] font-medium text-background"
            >
              Boshlash
            </Link>
          </li>
        </ul>
      )}
    </header>
  )
}