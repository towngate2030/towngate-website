"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type UnitLayoutType = "A" | "B" | "C" | "D" | "E" | "F";

export type UnitLayoutItem = {
  id: string;
  type: UnitLayoutType;
  title: string;
  area: number;
  floor: string;
  previewImageUrl: string;
  hdImageUrl: string;
  pdfUrl?: string;
};

function isValidUrl(s: string) {
  const v = String(s || "").trim();
  return v.startsWith("http://") || v.startsWith("https://");
}

type ViewerState = { open: true; index: number } | { open: false };

export function UnitTypesLayouts({
  locale,
  unitLayouts,
}: {
  locale: "ar" | "en";
  unitLayouts: UnitLayoutItem[];
}) {
  const items = useMemo(() => {
    return (unitLayouts || [])
      .filter(
        (x) =>
          x &&
          x.id &&
          x.type &&
          isValidUrl(x.previewImageUrl) &&
          isValidUrl(x.hdImageUrl),
      )
      .slice(0, 200);
  }, [unitLayouts]);

  const types: UnitLayoutType[] = ["A", "B", "C", "D", "E", "F"];
  const counts = useMemo(() => {
    const m = new Map<UnitLayoutType, number>();
    for (const t of types) m.set(t, 0);
    for (const it of items) m.set(it.type, (m.get(it.type) || 0) + 1);
    return m;
  }, [items]);

  const firstAvailableType = useMemo<UnitLayoutType | null>(() => {
    for (const t of types) if ((counts.get(t) || 0) > 0) return t;
    return null;
  }, [counts]);

  const [activeType, setActiveType] = useState<UnitLayoutType | null>(null);
  const [viewer, setViewer] = useState<ViewerState>({ open: false });

  useEffect(() => {
    setActiveType((prev) => {
      if (prev && (counts.get(prev) || 0) > 0) return prev;
      return firstAvailableType;
    });
  }, [counts, firstAvailableType]);

  const filtered = useMemo(() => {
    if (!activeType) return [];
    return items.filter((x) => x.type === activeType);
  }, [items, activeType]);

  // Hide section entirely if no layouts exist (prevents empty section)
  if (!items.length) return null;

  const title =
    locale === "ar" ? "أنواع الوحدات والمخططات" : "Unit Types & Layouts";

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-extrabold text-brand-navy md:text-2xl">
          {title}
        </h2>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {types.map((t) => {
          const disabled = (counts.get(t) || 0) === 0;
          const active = activeType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                if (disabled) return;
                setActiveType(t);
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                active
                  ? "border-brand-orange bg-brand-orange text-white"
                  : disabled
                    ? "border-brand-navy/10 bg-white text-brand-navy/30"
                    : "border-brand-navy/15 bg-white text-brand-navy hover:border-brand-orange/40"
              }`}
              aria-disabled={disabled}
            >
              Type {t}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((it, idx) => (
          <div
            key={it.id}
            className="overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-sm"
          >
            <div className="relative aspect-[16/10] w-full bg-brand-navy/5">
              <img
                src={it.previewImageUrl}
                alt={it.title}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-brand-navy">
                    {it.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-brand-navy/65">
                    {locale === "ar"
                      ? `المساحة ${it.area} م²`
                      : `Area ${it.area} m²`}
                    {" • "}
                    {locale === "ar" ? it.floor : it.floor}
                  </p>
                </div>
                <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-extrabold text-brand-orange">
                  Type {it.type}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setViewer({ open: true, index: idx })}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-orange px-4 py-2 text-sm font-extrabold text-white transition hover:brightness-110"
                >
                  {locale === "ar" ? "عرض المخطط" : "View Layout"}
                </button>
                {it.pdfUrl && isValidUrl(it.pdfUrl) ? (
                  <a
                    href={it.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-brand-navy/15 bg-white px-4 py-2 text-sm font-extrabold text-brand-navy transition hover:border-brand-orange/40"
                  >
                    {locale === "ar" ? "تحميل PDF" : "Download PDF"}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <LayoutViewer
        open={viewer.open}
        initialIndex={viewer.open ? viewer.index : 0}
        items={filtered}
        locale={locale}
        onClose={() => setViewer({ open: false })}
      />
    </section>
  );
}

function LayoutViewer({
  open,
  initialIndex,
  items,
  locale,
  onClose,
}: {
  open: boolean;
  initialIndex: number;
  items: UnitLayoutItem[];
  locale: "ar" | "en";
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number; cx: number; cy: number } | null>(
    null,
  );
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    setIdx(Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1)));
    setScale(1);
    setTx(0);
    setTy(0);
  }, [open, initialIndex, items.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((v) => (v > 0 ? v - 1 : v));
      if (e.key === "ArrowRight") setIdx((v) => (v < items.length - 1 ? v + 1 : v));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, items.length, onClose]);

  const active = items[idx];
  const canPrev = idx > 0;
  const canNext = idx < items.length - 1;

  function clampScale(s: number) {
    return Math.min(5, Math.max(1, s));
  }

  function resetTransform() {
    setScale(1);
    setTx(0);
    setTy(0);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      pinchStart.current = {
        dist,
        scale,
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
      };
      panStart.current = null;
      return;
    }

    if (pointers.current.size === 1) {
      panStart.current = { x: e.clientX, y: e.clientY, tx, ty };
      pinchStart.current = null;
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const pts = Array.from(pointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      const nextScale = clampScale((dist / pinchStart.current.dist) * pinchStart.current.scale);
      setScale(nextScale);
      return;
    }

    if (pointers.current.size === 1 && panStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTx(panStart.current.tx + dx);
      setTy(panStart.current.ty + dy);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      pinchStart.current = null;
      panStart.current = null;
    }
  }

  // Swipe left/right when not zoomed in
  const swipeStart = useRef<number | null>(null);
  function onSwipeStart(e: React.PointerEvent) {
    if (scale !== 1) return;
    swipeStart.current = e.clientX;
  }
  function onSwipeEnd(e: React.PointerEvent) {
    if (scale !== 1) return;
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start == null) return;
    const dx = e.clientX - start;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && canNext) setIdx((v) => v + 1);
    if (dx > 0 && canPrev) setIdx((v) => v - 1);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/90"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white backdrop-blur hover:bg-white/15"
          >
            {locale === "ar" ? "إغلاق" : "Close"}
          </button>

          <div className="absolute left-4 top-4 z-10 flex gap-2">
            <button
              type="button"
              onClick={resetTransform}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white backdrop-blur hover:bg-white/15"
            >
              {locale === "ar" ? "إعادة ضبط" : "Reset"}
            </button>
          </div>

          {active ? (
            <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-16">
              <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black">
                <div
                  className="absolute inset-0"
                  style={{ touchAction: "none" }}
                  onPointerDown={(e) => {
                    onPointerDown(e);
                    onSwipeStart(e);
                  }}
                  onPointerMove={onPointerMove}
                  onPointerUp={(e) => {
                    onPointerUp(e);
                    onSwipeEnd(e);
                  }}
                  onPointerCancel={onPointerUp}
                >
                  <div
                    className="absolute inset-0 grid place-items-center"
                    style={{
                      transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                      transformOrigin: "center",
                    }}
                  >
                    <img
                      src={active.hdImageUrl}
                      alt={active.title}
                      className="max-h-full max-w-full object-contain"
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Info overlay */}
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="rounded-2xl bg-black/45 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                    <span className="font-extrabold">Type {active.type}</span>
                    {" • "}
                    {locale === "ar"
                      ? `المساحة ${active.area} م²`
                      : `Area ${active.area} m²`}
                    {" • "}
                    {active.floor}
                  </div>
                </div>

                {/* Prev/Next */}
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                  <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => setIdx((v) => (v > 0 ? v - 1 : v))}
                    className={`pointer-events-auto grid h-11 w-11 place-items-center rounded-full ${
                      canPrev ? "bg-brand-orange text-white" : "bg-white/10 text-white/40"
                    }`}
                    aria-label="Prev"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setIdx((v) => (v < items.length - 1 ? v + 1 : v))}
                    className={`pointer-events-auto grid h-11 w-11 place-items-center rounded-full ${
                      canNext ? "bg-brand-orange text-white" : "bg-white/10 text-white/40"
                    }`}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

