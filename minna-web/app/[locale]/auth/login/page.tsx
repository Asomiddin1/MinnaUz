"use client"

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/src/i18n/navigation'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/intro/LanguageSwitcher'
import Logo, { LogoMark } from '@/components/intro/Logo'
const t = {
  auth: {
    emailInvalid: "Noto'g'ri email",
    codeIncomplete: "Kodni to'liq kiriting",
    codeWrong: "Kod noto'g'ri",
    quote: "Har bir yangi so'z — yangi dunyoga ochilgan eshik.",
    back: "Orqaga",
    successTitle: "Muvaffaqiyatli!",
    successSub: "Tizimga kirilmoqda...",
    title: "Xush kelibsiz",
    sub: "Email orqali tizimga kiring yoki ro'yxatdan o'ting.",
    google: "Google orqali davom etish",
    or: "yoki",
    emailLabel: "Email manzil",
    emailPlaceholder: "Sizning email manzilingiz",
    sending: "Yuborilmoqda...",
    sendCode: "Kodni olish",
    terms: "Tizimga kirish orqali siz bizning qoidalarga rozi bo'lasiz.",
    codeTitle: "Kodni kiriting",
    codeSub: "Kod shu manzilga yuborildi:",
    verifying: "Tekshirilmoqda...",
    verify: "Tasdiqlash",
    resendIn: "Qayta yuborish:",
    seconds: "s",
    resend: "Kodni qayta yuborish",
    changeEmail: "Emailni o'zgartirish",
  },
  footer: {
    rights: "© 2026 MinnaUz",
  },
}
import { useTheme } from 'next-themes'
import { signIn, getSession } from 'next-auth/react'

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

export default function Login() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'email' | 'code' | 'google'>(null)
  const [cooldown, setCooldown] = useState(0)

  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => setMounted(true), [])

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [cooldown])

  useEffect(() => {
    if (step === 'code') boxes.current[0]?.focus()
    if (step === 'done') {
      const finish = async () => {
        const session = await getSession();
        if ((session?.user as any)?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
      const id = window.setTimeout(finish, 1400)
      return () => window.clearTimeout(id)
    }
  }, [step, router])

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError(t.auth.emailInvalid)
      return
    }
    setError(null)
    setBusy('email')
    
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await res.json();

      if (res.ok) {
        setBusy(null)
        setStep('code')
        setCooldown(RESEND_SECONDS)
      } else {
        setError(data.message || "Xatolik yuz berdi");
        setBusy(null)
      }
    } catch (err) {
      setError("Server xatosi");
      setBusy(null)
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
    if (code.some((d) => !d)) {
      setError(t.auth.codeIncomplete)
      return
    }
    const otp = code.join('')
    setError(null)
    setBusy('code')

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email,
        otp_code: otp,
      });

      if (res?.error) {
        setError(t.auth.codeWrong);
        setBusy(null);
      } else {
        setBusy(null);
        setStep('done');
      }
    } catch (err) {
      setError("Server xatosi");
      setBusy(null);
    }
  }

  const google = () => {
    setBusy('google')
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr] bg-background text-foreground">
      <aside className="brand-panel relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        {/* Orqa fon rasmi tabiiy rangida */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/auth-bg.png')" }}
        />
        {/* Yozuvlar o'qilishi uchun chapdan o'ngga qoramtir gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />

        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/2 z-0 h-[520px] w-[520px] -translate-y-1/2 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)',
          }}
        />
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <LogoMark className="h-[26px] w-[26px]" />
          <span className="headline text-[19px] tracking-[-0.045em]">MinnaUz</span>
        </Link>

        <div className="relative z-10">
          <p className="font-jp text-[clamp(3.4rem,7vw,5.6rem)] leading-[1.05] drop-shadow-md">
            みんなで
            <br />
            まなぶ。
          </p>
          <p className="mt-8 max-w-[34ch] text-[17px] leading-relaxed opacity-90 drop-shadow-sm">{t.auth.quote}</p>
        </div>

        <p className="relative z-10 text-[13px] opacity-70">{t.footer.rights}</p>
      </aside>

      <main className="relative flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <Link
            href="/"
            className="hidden text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground lg:block"
          >
            ← {t.auth.back}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {mounted && (
              <button
                type="button"
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors duration-300 hover:bg-secondary"
              >
                <span className="text-[14px] leading-none">{theme === 'dark' ? '☾' : '☀'}</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[380px]">
            {step === 'done' ? (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-[22px] text-primary-foreground">
                  ✓
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
                      onClick={async () => {
                        // Resend logic
                        setError(null);
                        try {
                          const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/send-otp", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Accept: "application/json" },
                            body: JSON.stringify({ email: email }),
                          });
                          if (res.ok) {
                            setCode(Array(CODE_LENGTH).fill(''))
                            setCooldown(RESEND_SECONDS)
                            boxes.current[0]?.focus()
                          } else {
                            const data = await res.json();
                            setError(data.message || "Xatolik yuz berdi");
                          }
                        } catch (err) {
                          setError("Server xatosi");
                        }
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