"use client";

import Image from "next/image";
import { useState } from "react";

export function AdminLoginForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "err">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") || "");
    const password = String(fd.get("password") || "");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "Login failed");
        setStatus("err");
        return;
      }

      window.location.reload();
    } catch {
      setError("Network error");
      setStatus("err");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/brand/towngate-mark.svg"
          alt="TownGate"
          width={200}
          height={48}
          className="h-10 w-auto"
          priority
        />
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Admin login
        </h1>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-tg-cream/90">
            Username
          </label>
          <input
            name="username"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-white/20 bg-brand-navy/40 px-4 py-3 text-sm text-white outline-none ring-brand-orange/40 focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-tg-cream/90">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/20 bg-brand-navy/40 px-4 py-3 text-sm text-white outline-none ring-brand-orange/40 focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 w-full rounded-xl bg-brand-orange py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? "Signing in…" : "Sign in"}
        </button>

        {error ? (
          <p className="text-center text-xs font-semibold text-red-200">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

