"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SiteUnitLayoutGroup, SiteUnitLayoutItem } from "@/lib/cms";

type ViewerOpen = {
  groupIndex: number;
  itemIndex: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function touchDist(a: Touch, b: Touch) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

export function UnitTypesLayouts({
  locale,
  groups,
}: {
  locale: "ar" | "en";
  groups: SiteUnitLayoutGroup[];
}) {
  const title = locale === "ar" ? "أنواع الوحدات والمخططات" : "Unit Types & Layouts";

  const visibleGroups = useMemo(() => groups || [], [groups]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [viewer, setViewer] = useState<ViewerOpen | null>(null);

  const maxGroupIdx = Math.max(0, visibleGroups.length - 1);
  const effectiveGroupIndex = clamp(activeGroupIndex, 0, maxGroupIdx);
  const activeGroup = visibleGroups[effectiveGroupIndex];
  const activeItems: SiteUnitLayoutItem[] = activeGroup?.items ?? [];

  const groupLabel = useCallback(
    (g: SiteUnitLayoutGroup) => (locale === "ar" ? g.groupNameAr || g.groupNameEn : g.groupNameEn || g.groupNameAr),
    [locale],
  );

  const itemLabel = useCallback(
    (it: SiteUnitLayoutItem) => (locale === "ar" ? it.itemNameAr || it.itemNameEn : it.itemNameEn || it.itemNameAr),
    [locale],
  );

  if (!visibleGroups.length) return null;

  return (
    <section className="mt-10" aria-label={title}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="text-2xl font-extrabold text-brand-navy md:text-3xl">{title}</h2>
      </div>

      <div className="mt-5 -mx-1">
        <div
          role="tablist"
          aria-label={locale === "ar" ? "مجموعات المخططات" : "Layout groups"}
          className="flex gap-2 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleGroups.map((g, idx) => {
            const selected = idx === effectiveGroupIndex;
            return (
              <button
                key={`${groupLabel(g)}-${g.order}-${idx}`}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveGroupIndex(idx)}
                className={[
                  "shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition",
                  selected
                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/25"
                    : "bg-white text-brand-navy/80 ring-1 ring-brand-navy/10 hover:ring-brand-orange/35",
                ].join(" ")}
              >
                {groupLabel(g)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeItems.map((it, idx) => (
          <article
            key={`${it.image}-${it.order}-${idx}`}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-navy/10"
          >
            <div className="relative aspect-[4/3] w-full bg-brand-navy/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-4">
              <p className="text-sm font-bold leading-snug text-brand-navy md:text-base">{itemLabel(it)}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setViewer({ groupIndex: effectiveGroupIndex, itemIndex: idx })}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-extrabold text-white shadow-sm shadow-brand-orange/20 transition hover:brightness-110"
                >
                  {locale === "ar" ? "عرض المخطط" : "View Layout"}
                </button>

                {it.optionalPdf ? (
                  <a
                    href={it.optionalPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-brand-navy/15 px-4 py-2.5 text-sm font-extrabold text-brand-navy transition hover:border-brand-orange/40"
                  >
                    {locale === "ar" ? "تحميل PDF" : "Download PDF"}
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {viewer ? (
        <LayoutViewerModal
          key={`${viewer.groupIndex}-${viewer.itemIndex}`}
          locale={locale}
          groups={visibleGroups}
          open={viewer}
          onClose={() => setViewer(null)}
          itemLabel={itemLabel}
        />
      ) : null}
    </section>
  );
}

function LayoutViewerModal({
  locale,
  groups,
  open,
  onClose,
  itemLabel,
}: {
  locale: "ar" | "en";
  groups: SiteUnitLayoutGroup[];
  open: ViewerOpen;
  onClose: () => void;
  itemLabel: (it: SiteUnitLayoutItem) => string;
}) {
  const group = groups[open.groupIndex];
  const items = group?.items ?? [];

  const [index, setIndex] = useState(() => {
    const maxIdx = Math.max(0, items.length - 1);
    return clamp(open.itemIndex, 0, maxIdx);
  });

  const it = items[index];

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [dragging, setDragging] = useState(false);

  const dragLast = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);
  const oneFingerRef = useRef<{ x: number; y: number } | null>(null);

  const clampScale = (s: number) => clamp(s, 1, 5);

  const resetView = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const canPrev = index > 0;
  const canNext = index < items.length - 1;

  const goPrev = useCallback(() => {
    if (!canPrev) return;
    setScale(1);
    setTx(0);
    setTy(0);
    setIndex((i) => i - 1);
  }, [canPrev]);

  const goNext = useCallback(() => {
    if (!canNext) return;
    setScale(1);
    setTx(0);
    setTy(0);
    setIndex((i) => i + 1);
  }, [canNext]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Keep keyboard behavior aligned with the on-screen "Previous/Next" controls (which swap visually in RTL).
      if (e.key === "ArrowLeft") (locale === "ar" ? goNext : goPrev)();
      if (e.key === "ArrowRight") (locale === "ar" ? goPrev : goNext)();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [goNext, goPrev, locale, onClose]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const el = viewportRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    const next = clampScale(scale * zoomFactor);

    const worldX = (cx - rect.width / 2 - tx) / scale;
    const worldY = (cy - rect.height / 2 - ty) / scale;
    const newTx = cx - rect.width / 2 - worldX * next;
    const newTy = cy - rect.height / 2 - worldY * next;

    setScale(next);
    if (next === 1) {
      setTx(0);
      setTy(0);
    } else {
      setTx(newTx);
      setTy(newTy);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    setDragging(true);
    dragLast.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragLast.current) return;
    const dx = e.clientX - dragLast.current.x;
    const dy = e.clientY - dragLast.current.y;
    dragLast.current = { x: e.clientX, y: e.clientY };
    setTx((x) => x + dx);
    setTy((y) => y + dy);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    dragLast.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onTouchStart = (ev: TouchEvent) => {
      if (ev.touches.length === 2) {
        pinchRef.current = { startDist: touchDist(ev.touches[0], ev.touches[1]), startScale: scale };
        oneFingerRef.current = null;
      } else if (ev.touches.length === 1) {
        pinchRef.current = null;
        const t = ev.touches[0];
        oneFingerRef.current = { x: t.clientX, y: t.clientY };
      }
    };

    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length === 2 && pinchRef.current) {
        ev.preventDefault();
        const d = touchDist(ev.touches[0], ev.touches[1]);
        const ratio = d / pinchRef.current.startDist;
        setScale(clampScale(pinchRef.current.startScale * ratio));
        return;
      }

      if (ev.touches.length === 1 && scale > 1 && oneFingerRef.current) {
        ev.preventDefault();
        const t = ev.touches[0];
        const prev = oneFingerRef.current;
        const dx = t.clientX - prev.x;
        const dy = t.clientY - prev.y;
        oneFingerRef.current = { x: t.clientX, y: t.clientY };
        setTx((x) => x + dx);
        setTy((y) => y + dy);
      }
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
      oneFingerRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [scale]);

  if (!group || !it) return null;

  const navRowClass =
    locale === "ar" ? "flex flex-row-reverse items-center justify-between gap-3" : "flex items-center justify-between gap-3";

  return (
    <div className="fixed inset-0 z-[80] bg-black/90" role="dialog" aria-modal="true">
      <div className="absolute left-4 top-4 z-[90]">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15"
        >
          {locale === "ar" ? "إغلاق" : "Close"}
        </button>
      </div>

      <div className="absolute right-4 top-4 z-[90] flex gap-2">
        <button
          type="button"
          onClick={() => {
            setScale((s) => {
              const next = clampScale(s / 1.15);
              if (next === 1) {
                setTx(0);
                setTy(0);
              }
              return next;
            });
          }}
          className="rounded-full bg-brand-orange px-3 py-2 text-sm font-extrabold text-white shadow-lg shadow-brand-orange/25"
          aria-label={locale === "ar" ? "تصغير" : "Zoom out"}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setScale((s) => clampScale(s * 1.15))}
          className="rounded-full bg-brand-orange px-3 py-2 text-sm font-extrabold text-white shadow-lg shadow-brand-orange/25"
          aria-label={locale === "ar" ? "تكبير" : "Zoom in"}
        >
          +
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded-full bg-white/10 px-3 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15"
        >
          {locale === "ar" ? "إعادة ضبط" : "Reset"}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[90] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className={`mx-auto max-w-6xl ${navRowClass}`}>
          <button
            type="button"
            disabled={!canPrev}
            onClick={goPrev}
            className={[
              "rounded-full px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 transition",
              canPrev ? "bg-white/10 hover:bg-white/15" : "opacity-40",
            ].join(" ")}
          >
            {locale === "ar" ? "السابق" : "Previous"}
          </button>

          <div className="min-w-0 flex-1 px-2 text-center">
            <p className="truncate text-sm font-extrabold text-white/95 drop-shadow md:text-base">{itemLabel(it)}</p>
            <p className="mt-1 truncate text-xs text-white/60">
              {locale === "ar" ? group.groupNameAr || group.groupNameEn : group.groupNameEn || group.groupNameAr}
            </p>
          </div>

          <button
            type="button"
            disabled={!canNext}
            onClick={goNext}
            className={[
              "rounded-full px-4 py-2 text-sm font-extrabold text-white ring-1 ring-white/15 transition",
              canNext ? "bg-white/10 hover:bg-white/15" : "opacity-40",
            ].join(" ")}
          >
            {locale === "ar" ? "التالي" : "Next"}
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="h-full w-full touch-none select-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => {
          setScale((s) => {
            const next = s > 1 ? 1 : 2;
            if (next === 1) {
              setTx(0);
              setTy(0);
            }
            return next;
          });
        }}
      >
        <div className="flex h-full w-full items-center justify-center px-4 pb-28 pt-20">
          <div
            className="relative h-[min(78dvh,820px)] w-full max-w-[1100px] will-change-transform"
            style={{
              transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
              transformOrigin: "center center",
              transition: dragging ? "none" : "transform 120ms ease-out",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt={itemLabel(it)} className="h-full w-full object-contain" draggable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
