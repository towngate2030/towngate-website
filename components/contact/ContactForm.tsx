"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      message: String(fd.get("message") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("bad");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold">
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-xl border border-brand-navy/15 bg-tg-cream/50 px-4 py-3 text-brand-navy outline-none ring-brand-orange/30 transition focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-brand-navy/15 bg-tg-cream/50 px-4 py-3 text-brand-navy outline-none ring-brand-orange/30 transition focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-semibold">
          {t("phone")}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full rounded-xl border border-brand-navy/15 bg-tg-cream/50 px-4 py-3 text-brand-navy outline-none ring-brand-orange/30 transition focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-semibold">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-y rounded-xl border border-brand-navy/15 bg-tg-cream/50 px-4 py-3 text-brand-navy outline-none ring-brand-orange/30 transition focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-brand-orange py-3.5 text-base font-bold text-white shadow-md shadow-brand-orange/25 transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
      {status === "ok" ? (
        <p className="text-center text-sm font-semibold text-green-700">
          {t("success")}
        </p>
      ) : null}
      {status === "err" ? (
        <p className="text-center text-sm font-semibold text-red-600">
          {t("error")}
        </p>
      ) : null}
    </form>
  );
}
