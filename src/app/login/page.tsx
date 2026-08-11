"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { ApiError } from "@/lib/api";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, Sparkles, ShieldCheck } from "lucide-react";

const SPARKLES = [
  { top: "10%", left: "18%", size: 6, delay: "0s" },
  { top: "22%", left: "72%", size: 4, delay: "0.8s" },
  { top: "48%", left: "8%", size: 5, delay: "1.6s" },
  { top: "62%", left: "88%", size: 4, delay: "0.4s" },
  { top: "78%", left: "30%", size: 6, delay: "2.2s" },
  { top: "36%", left: "50%", size: 4, delay: "1.2s" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, token, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && token) router.replace("/dashboard/pages");
  }, [isLoading, token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard/pages");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-section p-4 sm:p-8">
      <div className="relative flex w-full max-w-[1440px] flex-wrap overflow-hidden rounded-[28px] bg-surface shadow-[0_30px_80px_-24px_rgba(76,29,149,0.35)] xl:flex-nowrap">

        {/* ── Form ── */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-surface to-primary-light xl:w-[42%]">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative mx-auto flex w-full max-w-[420px] flex-col justify-center px-8 py-14 sm:px-12">
            <h1 className="text-[32px] font-bold text-heading">Welcome back!</h1>
            <p className="mt-2 text-[15px] font-medium text-text-muted">Sign in to your account to continue.</p>

            {error && (
              <div className="mt-6 rounded-lg border border-status-danger-text/20 bg-status-danger-bg px-4 py-2.5 text-sm text-status-danger-text">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8">
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-heading">Email</label>
                <div className="relative">
                  <Mail size={18} strokeWidth={1.75} className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-text-helper" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12.5 pr-5 text-text outline-none transition focus:border-primary focus:shadow-[var(--shadow-focus)]"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-heading">Password</label>
                <div className="relative">
                  <Lock size={18} strokeWidth={1.75} className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-text-helper" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12.5 pr-11 text-text outline-none transition focus:border-primary focus:shadow-[var(--shadow-focus)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-helper transition-colors hover:text-text-muted"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              <div className="mb-7 flex items-center justify-between gap-2 text-sm font-medium">
                <label className="flex items-center gap-2 text-text-muted">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-[18px] w-[18px] rounded-md accent-primary"
                  />
                  Remember me
                </label>
                <button type="button" className="font-semibold text-primary outline-none transition-colors hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_24px_-8px_rgba(124,58,237,0.55)] transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Signing in…" : (
                  <>
                    Sign in <ArrowRight size={16} strokeWidth={2.2} />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-text-helper">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-text-muted">
              Need help? <button type="button" className="font-semibold text-primary hover:underline">Contact administrator</button>
            </p>
          </div>
        </div>

        {/* ── Branding panel ── */}
        <div className="relative hidden min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#100a24] xl:block xl:w-[58%]">
          <Image
            src="/loginpage.png"
            alt="గణన యంత్రం (Ganana Yantramu) CMS — manage pages, media, users, and content from one place"
            fill
            priority
            className="animate-kenburns object-cover"
            sizes="58vw"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#100a24]/85 via-transparent to-[#100a24]/90" />

          <div className="pointer-events-none absolute inset-0">
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="absolute animate-sparkle rounded-full bg-white"
                style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            {theme === "dark" ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
            {theme === "dark" ? "Dark" : "Light"}
          </button>

          <div className="relative z-10 flex flex-col items-center pt-10 text-center">
            <div className="flex items-center gap-3">
              <Image src="/logo-icon.png" alt="" width={56} height={56} className="h-14 w-14 drop-shadow-[0_2px_10px_rgba(139,92,246,0.6)]" />
              <p className="font-[family-name:var(--font-tech)] text-[28px] font-black uppercase tracking-wide">
                <span className="text-white">GANANA </span>
                <span className="text-violet-400">YANTRAMU </span>
                <span className="text-white">CMS</span>
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-violet-400/70" />
              <Sparkles size={14} className="text-violet-300" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-violet-400/70" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">Powerful. Flexible. Future-ready.</h2>
            <p className="mt-1 text-sm font-medium text-white/70">
              Everything you need to <span className="font-semibold text-violet-400">manage content</span>, your way.
            </p>
          </div>

          <div className="absolute inset-x-8 bottom-8 z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Secure • Scalable • Reliable</p>
              <p className="text-xs text-white/60">Built for modern teams and growing businesses.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
