"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_EMAIL = "judge@mizaan.demo";
const DEMO_PASSWORD = "mizaan-judge-2026";

interface LoginFormCopy {
  emailLabel: string;
  passwordLabel: string;
  submit: string;
  submitting: string;
  demoEyebrow: string;
  demoTitle: string;
  demoBody: string;
  demoCta: string;
  errorGeneric: string;
}

interface LoginFormProps {
  locale: "id" | "en";
  next: string;
  copy: LoginFormCopy;
}

export function LoginForm({ locale: _locale, next, copy }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    submittedEmail: string,
    submittedPassword: string,
  ) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: submittedEmail,
          password: submittedPassword,
        }),
      });
      const json = (await res.json()) as
        | { data: unknown; error: null }
        | { data: null; error: { code: string; message: string } };
      if (!res.ok || ("error" in json && json.error)) {
        const message =
          "error" in json && json.error ? json.error.message : null;
        setError(message ?? copy.errorGeneric);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid w-full gap-6 sm:gap-8 md:grid-cols-[1.2fr_1fr]">
      {/* Email + password form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(email, password);
        }}
        className="flex flex-col gap-4 rounded-[16px] border border-[#FFFFFF12] bg-[#1A1A1A] p-5 sm:gap-5 sm:p-7"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 45%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
            {copy.emailLabel}
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amil@laz.example"
            className="rounded-[10px] border border-[#FFFFFF12] bg-[#181818] px-3.5 py-2.5 text-sm leading-5 text-[#EFEFE4] outline-none transition-colors placeholder:text-[#EFEFE452] focus:border-[#14F1952E] focus:bg-[#14F19508]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
            {copy.passwordLabel}
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-[10px] border border-[#FFFFFF12] bg-[#181818] px-3.5 py-2.5 text-sm leading-5 text-[#EFEFE4] outline-none transition-colors placeholder:text-[#EFEFE452] focus:border-[#14F1952E] focus:bg-[#14F19508]"
          />
        </label>

        {error ? (
          <div className="rounded-[10px] border border-[#EF4444]/30 bg-[#EF4444]/10 px-3.5 py-2.5 text-[12px] leading-4 text-[#FCA5A5]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="mt-1 flex items-center justify-center gap-2 rounded-[10px] bg-[#14F195] px-4 py-2.75 font-mono text-[12px] font-medium leading-4 tracking-[0.04em] text-[#181818] transition-colors hover:bg-[#11D985] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? copy.submitting : copy.submit}
        </button>
      </form>

      {/* Demo judge access */}
      <aside
        className="flex flex-col gap-4 rounded-[16px] border border-[#14F1952E] bg-[#14F1950A] p-5 sm:gap-5 sm:p-7"
        style={{
          boxShadow: "inset 0 1px 0 rgba(20,241,149,0.18)",
        }}
      >
        <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#14F195]">
          {copy.demoEyebrow}
        </span>
        <h2 className="m-0 text-[18px] font-medium leading-6 tracking-[-0.015em] text-[#EFEFE4] sm:text-[20px] sm:leading-7">
          {copy.demoTitle}
        </h2>
        <p className="m-0 text-[13px] leading-5 text-[#EFEFE4BF]">
          {copy.demoBody}
        </p>
        <div className="flex flex-col gap-2 rounded-[10px] border border-[#FFFFFF12] bg-[#1A1A1A] px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
              email
            </span>
            <span className="font-mono text-[11px] leading-4 text-[#EFEFE4D9]">
              {DEMO_EMAIL}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
              password
            </span>
            <span className="font-mono text-[11px] leading-4 text-[#EFEFE4D9]">
              {DEMO_PASSWORD}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO_EMAIL);
            setPassword(DEMO_PASSWORD);
            void handleSubmit(DEMO_EMAIL, DEMO_PASSWORD);
          }}
          disabled={submitting}
          className="mt-auto flex items-center justify-center gap-2 rounded-[10px] border border-[#14F1952E] bg-[#14F19514] px-4 py-2.75 font-mono text-[12px] font-medium leading-4 tracking-[0.04em] text-[#14F195] transition-colors hover:bg-[#14F1951F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? copy.submitting : copy.demoCta}
        </button>
      </aside>
    </div>
  );
}
