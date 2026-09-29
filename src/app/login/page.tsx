"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login, token, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && token) router.replace("/dashboard");
  }, [isLoading, token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-start px-16 py-10 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/login-bg.webp"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Card */}
      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Image src="/ali-logo.png" alt="ALI" width={32} height={40} className="h-8 w-auto object-contain brightness-0 invert" priority />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight" style={{textShadow:"0 1px 8px rgba(0,0,0,0.35)"}}>ALI CMS Studio</h1>
            <p className="mt-0.5 text-[13px] text-white/80" style={{textShadow:"0 1px 4px rgba(0,0,0,0.3)"}}>Sign in to manage your content</p>
          </div>
        </div>

        {/* Form card — solid white */}
        <div className="rounded-xl bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-status-danger-text/20 bg-status-danger-bg px-4 py-3 text-[13px] text-status-danger-text">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 pr-10 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign In"}
              {!submitting && <ArrowRight size={15} strokeWidth={2.5} />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/50">
          © {new Date().getFullYear()} ALI CMS Studio · Blossm Weddings
        </p>
      </div>
    </div>
  );
}
