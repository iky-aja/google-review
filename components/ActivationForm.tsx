"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ActivationWizardProps {
  token: string;
  userEmail?: string;
  onActivate: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  googleSignInAction: () => Promise<void>;
}

export default function ActivationWizard({
  token,
  userEmail,
  onActivate,
  googleSignInAction,
}: ActivationWizardProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activated, setActivated] = useState(false);

  // Current active step calculation
  // Step 1: Login Or Register (Active if !userEmail)
  // Step 2: Add Review Link (Active if userEmail && !activated)
  // Step 3: Complete (Active if activated)
  const currentStep = activated ? 3 : userEmail ? 2 : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("businessName", businessName);
    formData.append("reviewUrl", reviewUrl);

    try {
      const result = await onActivate(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setActivated(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengaktifkan kartu.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold tracking-widest text-gold uppercase">Have Tech</span>
        <h1 className="text-2xl font-extrabold tracking-tight mt-1">Configure Smart Card</h1>
        <p className="text-xs text-text-secondary mt-1 font-mono">Token: {token}</p>
      </div>

      {/* Vertical Stepper Container */}
      <div className="rounded-xl border border-surface-2 bg-surface-1 p-6 shadow-xl relative overflow-hidden">
        
        {/* STEP 1: LOGIN OR REGISTER */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep > 1
                  ? "bg-gold text-canvas"
                  : currentStep === 1
                  ? "bg-gold text-canvas ring-4 ring-gold/20"
                  : "bg-surface-2 text-text-secondary"
              }`}
            >
              {currentStep > 1 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                "1"
              )}
            </div>
            <div
              className={`w-0.5 my-2 flex-1 min-h-[40px] transition-colors ${
                currentStep > 1 ? "bg-gold" : "bg-surface-2"
              }`}
            />
          </div>

          <div className="flex-1 pb-6">
            <h3
              className={`text-sm font-semibold tracking-wide ${
                currentStep >= 1 ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              Login Or Register
            </h3>

            {userEmail ? (
              <div className="mt-2 rounded-lg bg-surface-2 p-3 text-xs border border-gold/20 flex items-center justify-between">
                <div className="truncate">
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider">Logged in as</p>
                  <p className="font-semibold text-text-primary truncate">{userEmail}</p>
                </div>
                <span className="text-gold text-xs font-semibold px-2 py-0.5 rounded bg-gold/10">Verified</span>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs text-text-secondary mb-3">
                  Masuk dengan akun Google Anda untuk menghubungkan kepemilikan kartu fisik ini.
                </p>
                <form action={googleSignInAction}>
                  <button
                    type="submit"
                    className="w-full flex h-11 cursor-pointer items-center justify-center gap-3 rounded-lg bg-text-primary px-4 text-xs font-semibold text-canvas transition hover:opacity-90 shadow-md"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    Login with Google
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: ADD REVIEW LINK */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep > 2
                  ? "bg-gold text-canvas"
                  : currentStep === 2
                  ? "bg-gold text-canvas ring-4 ring-gold/20"
                  : "bg-surface-2 text-text-secondary"
              }`}
            >
              {currentStep > 2 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                "2"
              )}
            </div>
            <div
              className={`w-0.5 my-2 flex-1 min-h-[40px] transition-colors ${
                currentStep > 2 ? "bg-gold" : "bg-surface-2"
              }`}
            />
          </div>

          <div className="flex-1 pb-6">
            <h3
              className={`text-sm font-semibold tracking-wide ${
                currentStep >= 2 ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              Add Review Link
            </h3>

            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4">
                {/* Business Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bizName" className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    Nama Bisnis / Toko
                  </label>
                  <input
                    id="bizName"
                    type="text"
                    required
                    placeholder="Contoh: Kopi Kenangan / Resto Abadi"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-surface-2 px-3.5 text-xs text-text-primary placeholder:text-text-secondary/60 border border-surface-2 focus:outline-none focus:border-gold transition disabled:opacity-50"
                  />
                </div>

                {/* Google Review URL */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="revUrl" className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    Google Review URL
                  </label>
                  <input
                    id="revUrl"
                    type="url"
                    required
                    placeholder="https://g.page/r/..."
                    value={reviewUrl}
                    onChange={(e) => setReviewUrl(e.target.value)}
                    disabled={loading}
                    className={`h-11 w-full rounded-lg bg-surface-2 px-3.5 text-xs text-text-primary placeholder:text-text-secondary/60 border ${
                      error ? "border-destructive" : "border-surface-2"
                    } focus:outline-none focus:border-gold transition disabled:opacity-50`}
                  />
                  {error ? (
                    <p className="text-[11px] text-destructive">{error}</p>
                  ) : (
                    <p className="text-[10px] text-text-secondary leading-tight">
                      Mendukung: g.page, search.google.com, google.com, maps.app.goo.gl, goo.gl.
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex h-11 cursor-pointer items-center justify-center rounded-lg bg-gold px-4 text-xs font-semibold text-canvas transition hover:bg-gold-hover disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 text-canvas" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Activate Card →"
                  )}
                </button>
              </form>
            )}

            {currentStep < 2 && (
              <p className="text-xs text-text-secondary mt-1">Silakan login di Step 1 untuk melanjutkan.</p>
            )}

            {currentStep > 2 && (
              <div className="mt-2 rounded-lg bg-surface-2 p-3 text-xs border border-surface-2">
                <p className="text-text-secondary text-[10px] uppercase tracking-wider">Review Destination</p>
                <p className="font-semibold text-text-primary truncate mt-0.5">{reviewUrl || "Terhubung ke Google Review"}</p>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: COMPLETE */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep === 3
                  ? "bg-gold text-canvas ring-4 ring-gold/20"
                  : "bg-surface-2 text-text-secondary"
              }`}
            >
              {currentStep === 3 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                "3"
              )}
            </div>
          </div>

          <div className="flex-1">
            <h3
              className={`text-sm font-semibold tracking-wide ${
                currentStep === 3 ? "text-gold" : "text-text-secondary"
              }`}
            >
              Complete
            </h3>

            {currentStep === 3 ? (
              <div className="mt-3 rounded-xl bg-gold/10 p-4 border border-gold/30 text-center animate-fade-in">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold text-canvas mb-2">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-text-primary">Card is Live!</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Kartu fisik Anda sudah aktif. Setiap kali ada yang menempelkan HP / memindai QR kartu ini, pelanggan akan langsung diarahkan ke Google Review.
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-lg border border-gold/40 bg-surface-1 py-2 text-xs font-semibold text-gold transition hover:bg-gold hover:text-canvas"
                  >
                    Tes Buka Link Google Review ↗
                  </a>
                  <Link
                    href="/dashboard"
                    className="w-full rounded-lg bg-gold py-2 text-xs font-semibold text-canvas transition hover:bg-gold-hover"
                  >
                    Ke Dashboard Saya →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary mt-1">Selesaikan Step 2 untuk mengaktifkan kartu.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
