"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function NewsletterSignup() {
  const t = useTranslations("newsletter");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const website = String(fd.get("website") || "").trim();

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      if (!res.ok) throw new Error("bad");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm md:max-w-md">
      <p className="text-sm font-bold text-brand-orange">{t("title")}</p>
      <p className="mt-1 text-xs text-tg-cream/80">{t("subtitle")}</p>
      <form
        onSubmit={onSubmit}
        className="relative mt-4 flex flex-col gap-2 sm:flex-row"
      >
        <label className="sr-only" htmlFor="nl-email">
          {t("placeholder")}
        </label>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 rounded-xl border border-white/20 bg-brand-navy/40 px-4 py-2.5 text-sm text-tg-cream placeholder:text-tg-cream/45 outline-none ring-brand-orange/40 focus:ring-2"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? t("sending") : t("button")}
        </button>
      </form>
      {status === "ok" ? (
        <p className="mt-2 text-xs font-semibold text-green-300">{t("success")}</p>
      ) : null}
      {status === "err" ? (
        <p className="mt-2 text-xs font-semibold text-red-300">{t("error")}</p>
      ) : null}
    </div>
  );
}
