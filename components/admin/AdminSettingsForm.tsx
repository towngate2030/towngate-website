"use client";

import { useEffect, useMemo, useState } from "react";

type SettingsPayload = {
  heroBgUrl: string;
  kickerAr: string;
  kickerEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  valueBoxes: Array<{
    order: number;
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
  }>;
  whatsappContacts: Array<{ order: number; name: string; e164: string }>;
};

function emptyPayload(): SettingsPayload {
  return {
    heroBgUrl: "",
    kickerAr: "",
    kickerEn: "",
    heroTitleAr: "",
    heroTitleEn: "",
    heroSubtitleAr: "",
    heroSubtitleEn: "",
    valueBoxes: [
      { order: 1, titleAr: "", titleEn: "", bodyAr: "", bodyEn: "" },
      { order: 2, titleAr: "", titleEn: "", bodyAr: "", bodyEn: "" },
      { order: 3, titleAr: "", titleEn: "", bodyAr: "", bodyEn: "" },
    ],
    whatsappContacts: [{ order: 1, name: "Sales", e164: "966593053792" }],
  };
}

export function AdminSettingsForm() {
  const [data, setData] = useState<SettingsPayload>(() => emptyPayload());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Load failed");
        return j;
      })
      .then((j) => {
        const settings = j.settings || {};
        const valueBoxes = (j.valueBoxes || []).map((b: any) => ({
          order: b.order,
          titleAr: b.titleAr || "",
          titleEn: b.titleEn || "",
          bodyAr: b.bodyAr || "",
          bodyEn: b.bodyEn || "",
        }));
        const contacts = (j.whatsappContacts || []).map((c: any) => ({
          order: c.order,
          name: c.name || "",
          e164: String(c.e164 || "").replace(/\\D/g, ""),
        }));

        setData({
          heroBgUrl: settings.heroBgUrl || "",
          kickerAr: settings.kickerAr || "",
          kickerEn: settings.kickerEn || "",
          heroTitleAr: settings.heroTitleAr || "",
          heroTitleEn: settings.heroTitleEn || "",
          heroSubtitleAr: settings.heroSubtitleAr || "",
          heroSubtitleEn: settings.heroSubtitleEn || "",
          valueBoxes:
            valueBoxes.length === 3
              ? valueBoxes
              : emptyPayload().valueBoxes,
          whatsappContacts: contacts.length ? contacts : emptyPayload().whatsappContacts,
        });
      })
      .catch((e) => setMsg(String(e?.message || e)))
      .finally(() => setLoading(false));
  }, []);

  const canSave = useMemo(() => !loading && !saving, [loading, saving]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Save failed");
      setMsg("Saved.");
    } catch (e: any) {
      setMsg(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/15 bg-white/5 p-8">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Notice msg={msg} />

      <Section title="Hero">
        <Field
          label="Hero background URL (Cloudflare image)"
          value={data.heroBgUrl}
          onChange={(v) => setData({ ...data, heroBgUrl: v })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Kicker (AR)" value={data.kickerAr} onChange={(v) => setData({ ...data, kickerAr: v })} />
          <Field label="Kicker (EN)" value={data.kickerEn} onChange={(v) => setData({ ...data, kickerEn: v })} />
          <Field label="Title (AR)" value={data.heroTitleAr} onChange={(v) => setData({ ...data, heroTitleAr: v })} />
          <Field label="Title (EN)" value={data.heroTitleEn} onChange={(v) => setData({ ...data, heroTitleEn: v })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Area label="Subtitle (AR)" value={data.heroSubtitleAr} onChange={(v) => setData({ ...data, heroSubtitleAr: v })} />
          <Area label="Subtitle (EN)" value={data.heroSubtitleEn} onChange={(v) => setData({ ...data, heroSubtitleEn: v })} />
        </div>
      </Section>

      <Section title="Why TownGate (3 boxes)">
        <div className="grid gap-6 md:grid-cols-3">
          {data.valueBoxes.map((b, idx) => (
            <div key={b.order} className="rounded-2xl border border-white/10 bg-brand-navy/30 p-5">
              <p className="text-xs font-bold text-brand-orange">Box {b.order}</p>
              <div className="mt-3 space-y-3">
                <Field
                  label="Title (AR)"
                  value={b.titleAr}
                  onChange={(v) =>
                    setData({
                      ...data,
                      valueBoxes: data.valueBoxes.map((x, i) =>
                        i === idx ? { ...x, titleAr: v } : x,
                      ),
                    })
                  }
                />
                <Field
                  label="Title (EN)"
                  value={b.titleEn}
                  onChange={(v) =>
                    setData({
                      ...data,
                      valueBoxes: data.valueBoxes.map((x, i) =>
                        i === idx ? { ...x, titleEn: v } : x,
                      ),
                    })
                  }
                />
                <Area
                  label="Body (AR)"
                  value={b.bodyAr}
                  onChange={(v) =>
                    setData({
                      ...data,
                      valueBoxes: data.valueBoxes.map((x, i) =>
                        i === idx ? { ...x, bodyAr: v } : x,
                      ),
                    })
                  }
                />
                <Area
                  label="Body (EN)"
                  value={b.bodyEn}
                  onChange={(v) =>
                    setData({
                      ...data,
                      valueBoxes: data.valueBoxes.map((x, i) =>
                        i === idx ? { ...x, bodyEn: v } : x,
                      ),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="WhatsApp contacts">
        <p className="text-xs text-tg-cream/70">
          Add multiple numbers (digits only). The first one is used for the floating button.
        </p>
        <div className="mt-4 space-y-3">
          {data.whatsappContacts.map((c, idx) => (
            <div key={idx} className="grid gap-3 rounded-2xl border border-white/10 bg-brand-navy/30 p-4 md:grid-cols-[120px_1fr_1fr_auto] md:items-end">
              <Field
                label="Order"
                value={String(c.order)}
                onChange={(v) =>
                  setData({
                    ...data,
                    whatsappContacts: data.whatsappContacts.map((x, i) =>
                      i === idx ? { ...x, order: Number(v || 0) } : x,
                    ),
                  })
                }
              />
              <Field
                label="Name"
                value={c.name}
                onChange={(v) =>
                  setData({
                    ...data,
                    whatsappContacts: data.whatsappContacts.map((x, i) =>
                      i === idx ? { ...x, name: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="E164 digits"
                value={c.e164}
                onChange={(v) =>
                  setData({
                    ...data,
                    whatsappContacts: data.whatsappContacts.map((x, i) =>
                      i === idx ? { ...x, e164: v.replace(/\D/g, "") } : x,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-tg-cream/90 hover:bg-white/10"
                onClick={() =>
                  setData({
                    ...data,
                    whatsappContacts: data.whatsappContacts.filter((_, i) => i !== idx),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-tg-cream hover:bg-white/15"
            onClick={() =>
              setData({
                ...data,
                whatsappContacts: [
                  ...data.whatsappContacts,
                  {
                    order: data.whatsappContacts.length + 1,
                    name: "Sales",
                    e164: "",
                  },
                ],
              })
            }
          >
            + Add number
          </button>
        </div>
      </Section>

      <div className="pb-10">
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="w-full rounded-2xl bg-brand-orange py-4 text-sm font-extrabold text-white shadow-lg shadow-brand-orange/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Notice({ msg }: { msg: string }) {
  if (!msg) return null;
  const isErr = /fail|error|unauth|missing/i.test(msg);
  return (
    <div
      className={`rounded-2xl border p-4 text-sm font-semibold ${
        isErr
          ? "border-red-400/30 bg-red-500/10 text-red-100"
          : "border-green-400/30 bg-green-500/10 text-green-100"
      }`}
    >
      {msg}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8">
      <h2 className="text-lg font-extrabold tracking-tight text-white">{title}</h2>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-tg-cream/80">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-brand-navy/40 px-4 py-2.5 text-sm text-white outline-none ring-brand-orange/40 focus:ring-2"
      />
    </div>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-tg-cream/80">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full resize-y rounded-xl border border-white/20 bg-brand-navy/40 px-4 py-2.5 text-sm text-white outline-none ring-brand-orange/40 focus:ring-2"
      />
    </div>
  );
}

