'use client'

import { KitsuneMascot } from '@/components/kitsune/kitsune-mascot';

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Sun, Moon, ArrowLeft, Check } from 'lucide-react'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import Logo, { LogoMark } from '@/components/intro/Logo'
import { useLang } from '@/lib/i18n'
import { useThemeCtx } from '@/lib/theme'
import { useAuth } from '@/lib/auth-context'

type Step = 'email' | 'code' | 'done'

const CODE_LENGTH = 6
const RESEND_SECONDS = 45

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.28a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.11C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  )
}

function LoginForm() {
  const { t, lang } = useLang()
  const { theme, toggle } = useThemeCtx()
  const { isAuthenticated, user, sendOtp, loginWithOtp, loginWithGoogle } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'email' | 'code' | 'google'>(null)
  const [cooldown, setCooldown] = useState(0)
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null)
  
  const [mounted, setMounted] = useState(false)

  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('revoked') === 'true') {
        setError('Sessiyangiz admin tomonidan yoki boshqa qurilmadan bekor qilingan. Iltimos, qaytadan kiring.');
      } else if (isAuthenticated) {
        router.replace(
          user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
            ? `/${lang}/admin`
            : `/${lang}/dashboard`
        );
      }
    }
  }, [isAuthenticated, user, lang, router]);

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [cooldown])

  useEffect(() => {
    if (step === 'code') boxes.current[0]?.focus()
    if (step === 'done') {
      const id = window.setTimeout(() => router.push(`/${lang}/dashboard`), 1200)
      return () => window.clearTimeout(id)
    }
  }, [step, router, lang])

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError(t.auth.emailInvalid)
      return
    }
    setError(null)
    setBusy('email')

    try {
      const res = await sendOtp(email.trim())
      setBusy(null)
      setStep('code')
      setCooldown(RESEND_SECONDS)
      if (res.devCode) {
        setDevCodeHint(res.devCode)
      }
    } catch (err: any) {
      setBusy(null)
      setError(err.message || 'Xatolik yuz berdi. Qayta urinib koʻring.')
    }
  }

  const setDigit = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) {
      setCode((c) => c.map((d, i) => (i === index ? '' : d)))
      return
    }
    setCode((c) => {
      const next = [...c]
      digits.split('').forEach((d, offset) => {
        if (index + offset < CODE_LENGTH) next[index + offset] = d
      })
      return next
    })
    const landed = Math.min(index + digits.length, CODE_LENGTH - 1)
    boxes.current[landed]?.focus()
    setError(null)
  }

  const onDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      e.preventDefault()
      boxes.current[index - 1]?.focus()
      setCode((c) => c.map((d, i) => (i === index - 1 ? '' : d)))
    }
    if (e.key === 'ArrowLeft' && index > 0) boxes.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) boxes.current[index + 1]?.focus()
  }

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const enteredCode = code.join('')
    if (code.some((d) => !d) || enteredCode.length < CODE_LENGTH) {
      setError(t.auth.codeIncomplete)
      return
    }
    setError(null)
    setBusy('code')

    try {
      await loginWithOtp(email.trim(), enteredCode)
      setBusy(null)
      setStep('done')
    } catch (err: any) {
      setBusy(null)
      setError(err.message || "Tasdiqlash kodi noto'g'ri")
    }
  }

  const google = () => {
    setBusy('google')
    setError(null)

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (clientId && typeof window !== 'undefined') {
      const redirectUri = `${window.location.origin}/auth/google/callback`
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=id_token%20token&scope=openid%20email%20profile&nonce=${Date.now()}&prompt=select_account`

      window.location.href = authUrl
      return
    }

    loginWithGoogle('google-mock-token')
      .then(() => {
        setBusy(null)
        setStep('done')
      })
      .catch((err: any) => {
        setBusy(null)
        setError(err.message || 'Google orqali kirishda xatolik yuz berdi')
      })
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden p-8 lg:p-12 md:flex md:flex-col md:justify-between text-white bg-zinc-950">
        <Image
          src="/auth_bg.jpg"
          alt="Auth Background"
          fill
          priority
          sizes="50vw"
          className="object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 z-[1]" />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 drop-shadow">
          <LogoMark className="h-[28px] w-[28px]" />
          <span className="headline text-[20px] font-semibold tracking-[-0.045em] text-white">MinnaUz</span>
        </Link>

        {/* O'zingizning yaponcha original yozuvingiz va bir qatorda chiqadigan holati */}
        <div className="relative z-10 space-y-4">
          <p className="font-jp text-[clamp(3.4rem,7vw,5.6rem)] leading-[1.05] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] font-medium">
            みんなでまなぶ。
          </p>
        </div>

        <p className="relative z-10 text-[13px] text-white/75 drop-shadow">{t.footer.rights}</p>
      </aside>

      <main className="relative flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground lg:flex"
          >
            <ArrowLeft className="h-4 w-4" /> {t.auth.back}
          </Link>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            <button
              type="button"
              onClick={toggle}
              aria-label={!mounted ? 'Toggle theme' : theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors duration-300 hover:bg-secondary"
            >
              {!mounted ? (
                <span className="h-[18px] w-[18px]" />
              ) : theme === 'dark' ? (
                <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
              ) : (
                <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
              )}
            </button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[380px]">
            <KitsuneMascot state={step === 'done' ? 'celebrating' : 'welcome'} size="small" animate className="mb-5" />
            {step === 'done' ? (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h1 className="headline mt-6 text-[32px]">{t.auth.successTitle}</h1>
                <p className="mt-2 text-[15px] text-muted-foreground">{t.auth.successSub}</p>
              </div>
            ) : step === 'email' ? (
              <>
                <h1 className="headline text-[clamp(2rem,4vw,2.6rem)]">{t.auth.title}</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {t.auth.sub}
                </p>

                <button
                  type="button"
                  onClick={google}
                  disabled={busy !== null}
                  className="mt-9 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-6 py-3 text-[15px] font-medium transition-all duration-300 hover:bg-secondary active:scale-[0.98] disabled:opacity-60"
                >
                  <GoogleIcon />
                  {t.auth.google}
                </button>

                <div className="my-7 flex items-center gap-4">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t.auth.or}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={submitEmail} noValidate>
                  <label
                    htmlFor="email"
                    className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {t.auth.emailLabel}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    placeholder={t.auth.emailPlaceholder}
                    aria-invalid={Boolean(error)}
                    className="mt-2 w-full rounded-[16px] border border-border bg-card px-4 py-3 text-[16px] outline-none transition-colors duration-300 placeholder:text-muted-foreground/60 focus:border-foreground/40"
                  />
                  {error && <p className="mt-2 text-[13px] text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={busy !== null}
                    className="mt-5 w-full rounded-full bg-foreground px-6 py-3 text-[15px] font-medium text-background transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy === 'email' ? t.auth.sending : t.auth.sendCode}
                  </button>
                </form>

                <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
                  {t.auth.terms}
                </p>
              </>
            ) : (
              <>
                <h1 className="headline text-[clamp(2rem,4vw,2.6rem)]">{t.auth.codeTitle}</h1>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  {t.auth.codeSub} <span className="text-foreground">{email}</span>
                </p>

                <form onSubmit={submitCode}>
                  <div className="mt-8 flex gap-2">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          boxes.current[i] = el
                        }}
                        value={digit}
                        onChange={(e) => setDigit(i, e.target.value)}
                        onKeyDown={(e) => onDigitKeyDown(i, e)}
                        inputMode="numeric"
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        maxLength={CODE_LENGTH}
                        aria-label={`${i + 1}`}
                        className="headline h-14 w-full min-w-0 rounded-[14px] border border-border bg-card text-center text-[22px] tabular-nums outline-none transition-colors duration-300 focus:border-foreground/50"
                      />
                    ))}
                  </div>
                  {error && <p className="mt-3 text-[13px] text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={busy !== null}
                    className="mt-6 w-full rounded-full bg-foreground px-6 py-3 text-[15px] font-medium text-background transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy === 'code' ? t.auth.verifying : t.auth.verify}
                  </button>
                </form>

                <div className="mt-6 flex flex-col gap-2 text-[13px] text-muted-foreground">
                  {cooldown > 0 ? (
                    <span>
                      {t.auth.resendIn} {cooldown}
                      {t.auth.seconds}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCode(Array(CODE_LENGTH).fill(''))
                        setCooldown(RESEND_SECONDS)
                        boxes.current[0]?.focus()
                      }}
                      className="self-start text-foreground underline underline-offset-4"
                    >
                      {t.auth.resend}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setCode(Array(CODE_LENGTH).fill(''))
                      setError(null)
                    }}
                    className="self-start transition-colors duration-300 hover:text-foreground"
                  >
                    {t.auth.changeEmail}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return <LoginForm />
}