"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type NewsletterIssueRow = {
  _id: string;
  title?: string;
  subjectLine?: string;
  status?: string;
  sentAt?: string;
  recipientCount?: number;
};

export function NewsletterSendPanel({
  issues,
  subscriberCount,
}: {
  issues: NewsletterIssueRow[];
  subscriberCount: number;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  async function send(issueId: string, forceResend: boolean) {
    setBusyId(issueId);
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, forceResend }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setMessage(String(data.error || `Send failed (${res.status})`));
        return;
      }
      setMessage(
        `Sent OK: ${String(data.sent ?? "")} / ${String(data.attempted ?? "")} (refresh page to see updated status).`,
      );
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-brand-navy/30 p-5">
      <p className="text-sm font-extrabold text-white">Newsletter broadcast</p>
      <p className="mt-2 text-xs leading-relaxed text-tg-cream/75">
        Active subscribers in Sanity: <span className="font-extrabold text-white">{subscriberCount}</span>. Compose
        issues in Sanity Studio → <span className="font-mono text-tg-cream/90">Newsletter issues</span>, then send
        from here.
      </p>

      {message ? (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-tg-cream">{message}</p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-tg-cream/70">
              <th className="py-2 pr-3 font-extrabold">Title</th>
              <th className="py-2 pr-3 font-extrabold">Subject</th>
              <th className="py-2 pr-3 font-extrabold">Status</th>
              <th className="py-2 pr-3 font-extrabold">Sent</th>
              <th className="py-2 font-extrabold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.length ? (
              issues.map((it) => (
                <tr key={it._id} className="border-b border-white/5 align-top">
                  <td className="py-3 pr-3 font-semibold text-white">{it.title || "—"}</td>
                  <td className="py-3 pr-3 text-tg-cream/85">{it.subjectLine || "—"}</td>
                  <td className="py-3 pr-3 text-tg-cream/85">{it.status || "—"}</td>
                  <td className="py-3 pr-3 text-tg-cream/70">
                    {it.sentAt ? new Date(it.sentAt).toLocaleString() : "—"}
                    {typeof it.recipientCount === "number" ? (
                      <span className="block text-[11px] text-tg-cream/55">Recipients: {it.recipientCount}</span>
                    ) : null}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        disabled={busyId === it._id || it.status === "sent"}
                        onClick={() => void send(it._id, false)}
                        className="rounded-xl bg-brand-orange px-3 py-2 text-[11px] font-extrabold text-white shadow-md shadow-brand-orange/20 transition hover:brightness-110 disabled:opacity-40"
                      >
                        {busyId === it._id ? "Sending…" : "Send to all"}
                      </button>
                      {it.status === "sent" ? (
                        <button
                          type="button"
                          disabled={busyId === it._id}
                          onClick={() => {
                            if (!window.confirm("Resend this issue to all active subscribers?")) return;
                            void send(it._id, true);
                          }}
                          className="rounded-xl border border-white/20 px-3 py-2 text-[11px] font-extrabold text-tg-cream transition hover:bg-white/10 disabled:opacity-40"
                        >
                          Force resend
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-tg-cream/70">
                  No issues yet. Create one in Sanity Studio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
