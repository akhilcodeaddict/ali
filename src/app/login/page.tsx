"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import Image from "next/image";
import { Monitor, FileText, Settings2, TrendingUp, ArrowRight } from "lucide-react";

function CmsIllustration() {
  return (
    <svg viewBox="0 0 460 290" xmlns="http://www.w3.org/2000/svg" fill="none" style={{ width: "100%", maxWidth: "460px" }}>
      <defs>
        <linearGradient id="wbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E2D5A" />
          <stop offset="100%" stopColor="#0F1829" />
        </linearGradient>
        <linearGradient id="btngrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="cardgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A2D50" />
          <stop offset="100%" stopColor="#111D3A" />
        </linearGradient>
        <filter id="softglow">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id="platform" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Platform glow */}
      <ellipse cx="230" cy="278" rx="185" ry="14" fill="url(#platform)" filter="url(#softglow)" />

      {/* Drop shadow window */}
      <rect x="76" y="50" width="294" height="210" rx="12" fill="#060C1A" opacity="0.7" />

      {/* Main browser window */}
      <rect x="68" y="42" width="294" height="210" rx="12" fill="url(#wbg)" stroke="rgba(59,130,246,0.45)" strokeWidth="1.2" />

      {/* Title bar */}
      <rect x="68" y="42" width="294" height="34" rx="12" fill="#16213A" />
      <rect x="68" y="64" width="294" height="12" fill="#16213A" />

      {/* Window dots */}
      <circle cx="87" cy="59" r="5.5" fill="#FF5F56" />
      <circle cx="104" cy="59" r="5.5" fill="#FFBD2E" />
      <circle cx="121" cy="59" r="5.5" fill="#27C93F" />

      {/* URL bar */}
      <rect x="143" y="50" width="148" height="18" rx="9" fill="#0D1829" stroke="rgba(96,165,250,0.25)" strokeWidth="1" />
      <text x="152" y="62.5" fontSize="7.5" fill="#60A5FA" opacity="0.65" fontFamily="monospace">jalasthali.com/cms</text>

      {/* Sidebar */}
      <rect x="68" y="76" width="56" height="176" fill="#101929" fillOpacity="0.95" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="76" y={88 + i * 24} width="40" height="13" rx="6.5" fill={i === 0 ? "url(#btngrad)" : "#1E2E4D"} fillOpacity={i === 0 ? 1 : 0.75} />
      ))}

      {/* Content top bar */}
      <rect x="124" y="76" width="238" height="30" fill="#182037" />
      <rect x="132" y="86" width="88" height="10" rx="5" fill="#1E3060" fillOpacity="0.8" />
      <rect x="319" y="83" width="35" height="17" rx="8.5" fill="url(#btngrad)" />

      {/* Hero card */}
      <rect x="130" y="114" width="144" height="90" rx="8" fill="url(#cardgrad)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
      <rect x="130" y="114" width="144" height="42" rx="8" fill="#1A2D50" />
      <rect x="130" y="144" width="144" height="12" fill="#1A2D50" />
      {/* Mountain silhouette */}
      <path d="M158 148 L178 126 L198 148Z" fill="rgba(96,165,250,0.12)" />
      <path d="M185 148 L210 120 L235 148Z" fill="rgba(96,165,250,0.18)" />
      <circle cx="215" cy="124" r="5" fill="rgba(255,214,80,0.22)" />
      {/* Card content lines */}
      <rect x="138" y="162" width="102" height="7" rx="3.5" fill="#2D3E6B" fillOpacity="0.7" />
      <rect x="138" y="174" width="72" height="7" rx="3.5" fill="#2D3E6B" fillOpacity="0.5" />
      <rect x="138" y="187" width="52" height="12" rx="6" fill="url(#btngrad)" />

      {/* Right card 1 */}
      <rect x="282" y="114" width="76" height="56" rx="8" fill="url(#cardgrad)" stroke="rgba(124,58,237,0.3)" strokeWidth="1" />
      <rect x="290" y="122" width="30" height="7" rx="3.5" fill="#818CF8" fillOpacity="0.7" />
      <rect x="290" y="134" width="58" height="5" rx="2.5" fill="#334060" fillOpacity="0.7" />
      <rect x="290" y="143" width="44" height="5" rx="2.5" fill="#334060" fillOpacity="0.5" />
      <rect x="290" y="154" width="36" height="10" rx="5" fill="url(#btngrad)" />

      {/* Right card 2 — bar chart */}
      <rect x="282" y="178" width="76" height="48" rx="8" fill="url(#cardgrad)" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
      {[
        { x: 290, h: 14, c: "#3B82F6" },
        { x: 301, h: 22, c: "#818CF8" },
        { x: 312, h: 10, c: "#3B82F6" },
        { x: 323, h: 26, c: "#7C3AED" },
        { x: 334, h: 18, c: "#60A5FA" },
      ].map(({ x, h, c }, i) => (
        <rect key={i} x={x} y={208 - h} width="8" height={h} rx="3" fill={c} fillOpacity="0.75" />
      ))}
      <rect x="290" y="212" width="60" height="5" rx="2.5" fill="#334060" fillOpacity="0.5" />

      {/* Bottom strip */}
      <rect x="130" y="212" width="144" height="30" rx="8" fill="#182037" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <rect x="138" y="221" width="82" height="5" rx="2.5" fill="#2D3E6B" fillOpacity="0.7" />
      <rect x="138" y="230" width="56" height="5" rx="2.5" fill="#2D3E6B" fillOpacity="0.5" />

      {/* Floating code tag */}
      <rect x="12" y="92" width="52" height="34" rx="8" fill="#13203A" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
      <text x="24" y="114" fontSize="14" fill="#60A5FA" opacity="0.75" fontFamily="monospace">&lt;/&gt;</text>

      {/* Floating globe */}
      <rect x="376" y="52" width="44" height="44" rx="10" fill="#13203A" stroke="rgba(124,58,237,0.4)" strokeWidth="1" />
      <circle cx="398" cy="74" r="12" stroke="#818CF8" strokeWidth="1" strokeOpacity="0.7" />
      <path d="M386 74 Q398 68 410 74" stroke="#818CF8" strokeWidth="0.9" strokeOpacity="0.6" />
      <path d="M386 74 Q398 80 410 74" stroke="#818CF8" strokeWidth="0.9" strokeOpacity="0.6" />
      <line x1="398" y1="62" x2="398" y2="86" stroke="#818CF8" strokeWidth="0.9" strokeOpacity="0.55" />

      {/* Floating chart */}
      <rect x="376" y="108" width="52" height="50" rx="10" fill="#13203A" stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
      {[
        { x: 384, h: 14 }, { x: 395, h: 22 }, { x: 406, h: 10 }, { x: 417, h: 26 },
      ].map(({ x, h }, i) => (
        <rect key={i} x={x} y={152 - h} width="8" height={h} rx="3" fill={i % 2 === 0 ? "#60A5FA" : "#818CF8"} fillOpacity="0.75" />
      ))}

      {/* Decorative dots & squares */}
      <circle cx="18" cy="158" r="3" fill="#3B82F6" opacity="0.35" />
      <circle cx="442" cy="170" r="3" fill="#7C3AED" opacity="0.35" />
      <circle cx="28" cy="222" r="2" fill="#60A5FA" opacity="0.3" />
      <rect x="6" y="184" width="8" height="8" rx="2" fill="#3B82F6" fillOpacity="0.25" />
      <rect x="442" y="84" width="6" height="6" rx="1.5" fill="#7C3AED" fillOpacity="0.3" />
    </svg>
  );
}

const features = [
  { Icon: Monitor,    label: "Websites" },
  { Icon: FileText,   label: "Pages"    },
  { Icon: Settings2,  label: "Manage"   },
  { Icon: TrendingUp, label: "Grow"     },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, token, isLoading } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState<string | null>(null);
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
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#060C18 0%,#0D1228 55%,#080F1F 100%)" }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex"
        style={{ flex: "0 0 55%", flexDirection: "column", padding: "40px 60px", position: "relative", overflow: "hidden" }}
      >
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "15%", left: "15%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,.14) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "18%", right: "8%",  width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.11) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.png" alt="Jalasthali" width={80} height={80} priority />
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Jalasthali</p>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", color: "#60A5FA", textTransform: "uppercase" }}>CMS Website Builder</p>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginTop: 54 }}>
          <h1 style={{ margin: 0, fontSize: 50, fontWeight: 800, lineHeight: 1.15 }}>
            <span style={{ color: "#60A5FA" }}>Build.</span>{" "}
            <span style={{ color: "#A78BFA" }}>Manage.</span>{" "}
            <span style={{ color: "#60A5FA" }}>Publish.</span>
          </h1>
          <p style={{ marginTop: 12, fontSize: 17, color: "rgba(186,213,255,.58)" }}>All in One Powerful CMS.</p>
        </div>

        {/* Illustration */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 24 }}>
          <CmsIllustration />
        </div>

        {/* Feature icons */}
        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginBottom: 18 }}>
          {features.map(({ Icon, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, border: "1px solid rgba(96,165,250,.28)", background: "rgba(59,130,246,.09)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} color="#60A5FA" strokeWidth={1.5} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(186,213,255,.5)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(186,213,255,.3)", marginTop: 4 }}>
          © 2025 <span style={{ color: "#60A5FA" }}>Jalasthali</span>. All rights reserved.
        </p>
      </div>

      {/* ── Right login card ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "rgba(13,20,40,.88)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "48px 40px", backdropFilter: "blur(24px)", boxShadow: "0 28px 80px rgba(0,0,0,.55)" }}>

          {/* Lock icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#60A5FA" strokeWidth="1.8" />
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1.5" fill="#60A5FA" />
              </svg>
            </div>
          </div>

          <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, color: "#fff", textAlign: "center" }}>Welcome Back</h2>
          <p style={{ margin: "0 0 34px", fontSize: 14, color: "rgba(186,213,255,.5)", textAlign: "center" }}>Sign in to continue to your dashboard</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#FCA5A5", fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "rgba(226,232,240,.8)", marginBottom: 8 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(96,165,250,.6)", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M1 5.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@domain.com"
                  required
                  style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 14px 12px 40px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,.5)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(226,232,240,.8)" }}>Password</label>
                <button type="button" style={{ background: "none", border: "none", padding: 0, fontSize: 13, color: "#60A5FA", cursor: "pointer" }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(96,165,250,.6)", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="7" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 14px 12px 40px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,.5)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")}
                />
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#3B82F6", cursor: "pointer" }}
              />
              <label htmlFor="remember" style={{ fontSize: 13, color: "rgba(186,213,255,.6)", cursor: "pointer" }}>Remember me</label>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={submitting}
              style={{ width: "100%", background: submitting ? "rgba(59,130,246,.45)" : "linear-gradient(135deg,#3B5CF6 0%,#7C3AED 100%)", border: "none", borderRadius: 10, padding: "13px 20px", fontSize: 15, fontWeight: 600, color: "#fff", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity .15s" }}
            >
              {submitting ? "Signing in…" : (
                <>
                  Sign in
                  <ArrowRight size={18} strokeWidth={2.2} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
