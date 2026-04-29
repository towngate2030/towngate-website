"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  locale: "ar" | "en";
  title: string;
  images: string[];
  videos: string[];
};

type Selected =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string };

type MobileItem = Selected & { key: string };

function uniq(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of items) {
    const v = String(s || "").trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export function ProjectMediaGallery({ locale, title, images, videos }: Props) {
  const imgs = useMemo(() => uniq(images), [images]);
  const vids = useMemo(() => uniq(videos).slice(0, 20), [videos]);
  // Keep all 3 columns aligned. Use a slightly shorter height so videos fill without letterboxing.
  const mediaHeight = "h-[260px] sm:h-[320px] md:h-[460px] lg:h-[520px]";

  const [selected, setSelected] = useState<Selected | null>(() => {
    if (imgs[0]) return { kind: "image", src: imgs[0] };
    if (vids[0]) return { kind: "video", src: vids[0] };
    return null;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto slideshow for images until user selects something.
  const [autoplay, setAutoplay] = useState(true);
  const idxRef = useRef(0);

  // Ensure we always have something selected once media arrives (fixes empty viewer on some mobile hydrations)
  useEffect(() => {
    if (selected) return;
    if (imgs[0]) {
      setSelected({ kind: "image", src: imgs[0] });
      return;
    }
    if (vids[0]) {
      setSelected({ kind: "video", src: vids[0] });
    }
  }, [imgs, vids, selected]);

  // Always render something if media exists (avoids grey/empty frame before effects run)
  const fallbackSelected = useMemo<Selected | null>(() => {
    if (imgs[0]) return { kind: "image", src: imgs[0] };
    if (vids[0]) return { kind: "video", src: vids[0] };
    return null;
  }, [imgs, vids]);
  const effectiveSelected = selected ?? fallbackSelected;

  useEffect(() => {
    if (!autoplay) return;
    if (imgs.length < 2) return;

    const id = window.setInterval(() => {
      idxRef.current = (idxRef.current + 1) % imgs.length;
      setSelected({ kind: "image", src: imgs[idxRef.current] });
    }, 6500);
    return () => window.clearInterval(id);
  }, [autoplay, imgs]);

  function choose(sel: Selected) {
    setAutoplay(false);
    setSelected(sel);
  }

  const empty = !effectiveSelected;
  const sideLabelImages = locale === "ar" ? "صور" : "Images";
  const sideLabelVideos = locale === "ar" ? "فيديو" : "Videos";

  const mobileItems = useMemo<MobileItem[]>(() => {
    const items: MobileItem[] = [];
    for (const src of imgs) items.push({ kind: "image", src, key: `i:${src}` });
    for (const src of vids) items.push({ kind: "video", src, key: `v:${src}` });
    return items;
  }, [imgs, vids]);

  // Mobile swipe between media in the main frame
  const swipeRef = useRef<{
    startX: number;
    active: boolean;
  }>({ startX: 0, active: false });

  const effectiveIndex = useMemo(() => {
    if (!effectiveSelected) return -1;
    return mobileItems.findIndex(
      (it) => it.kind === effectiveSelected.kind && it.src === effectiveSelected.src,
    );
  }, [effectiveSelected, mobileItems]);

  function stepMobile(delta: -1 | 1) {
    if (!mobileItems.length) return;
    const cur = effectiveIndex >= 0 ? effectiveIndex : 0;
    const next = (cur + delta + mobileItems.length) % mobileItems.length;
    choose({ kind: mobileItems[next].kind, src: mobileItems[next].src });
  }

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  return (
    <section className="mx-auto w-full max-w-full overflow-visible rounded-3xl border border-brand-navy/10 bg-white p-4 shadow-sm md:overflow-hidden md:p-6">
      <div className="grid max-w-full gap-4 md:grid-cols-[160px_1fr_160px] md:gap-6">
        {/* Left rail (videos) — moves top -> bottom */}
        <div className="order-2 hidden md:block md:order-1">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-navy/60">
            {sideLabelVideos}
          </p>
          <Rail direction="down" className={mediaHeight}>
            {vids.length ? (
              vids.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => choose({ kind: "video", src: v })}
                  className="relative block aspect-[9/16] w-full overflow-hidden rounded-xl border border-brand-navy/10 bg-black/90"
                  aria-label="Video"
                >
                  <video
                    src={v}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-brand-navy">
                    ▶
                  </div>
                </button>
              ))
            ) : (
              <EmptyTile label={locale === "ar" ? "لا يوجد فيديوهات" : "No videos"} />
            )}
          </Rail>
        </div>

        {/* Center viewer */}
        <div className="order-1 md:order-2">
          <div
            className={`relative mx-auto w-full max-w-full overflow-hidden rounded-2xl border border-brand-navy/10 bg-brand-navy/5 ${mediaHeight}`}
          >
            <div className="relative h-full w-full">
              <AnimatePresence mode="wait">
                {empty ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 grid place-items-center"
                  >
                    <p className="text-sm font-semibold text-brand-navy/60">
                      {locale === "ar"
                        ? "أضف صورًا أو فيديوهات للمشروع"
                        : "Add images or videos to this project"}
                    </p>
                  </motion.div>
                ) : effectiveSelected.kind === "image" ? (
                  <motion.div
                    key={`img:${effectiveSelected.src}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 will-change-[opacity] touch-pan-y select-none"
                    onPointerDown={(e) => {
                      swipeRef.current = { startX: e.clientX, active: true };
                    }}
                    onPointerUp={(e) => {
                      if (!swipeRef.current.active) return;
                      swipeRef.current.active = false;
                      const dx = e.clientX - swipeRef.current.startX;
                      if (Math.abs(dx) < 40) return;
                      stepMobile(dx < 0 ? 1 : -1);
                    }}
                    onPointerCancel={() => {
                      swipeRef.current.active = false;
                    }}
                  >
                    {/* Soft blurred backdrop so "contain" doesn't feel empty */}
                    <Image
                      src={effectiveSelected.src}
                      alt=""
                      fill
                      aria-hidden
                      className="object-cover scale-110 blur-2xl opacity-35"
                      sizes="100vw"
                      priority
                    />
                    <Image
                      src={effectiveSelected.src}
                      alt={title}
                      fill
                      className="object-contain"
                      sizes="(max-width:768px) 100vw, 60vw"
                      priority
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35))]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`vid:${effectiveSelected.src}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute inset-0 bg-black/95 will-change-[opacity] touch-pan-y select-none"
                    onPointerDown={(e) => {
                      swipeRef.current = { startX: e.clientX, active: true };
                    }}
                    onPointerUp={(e) => {
                      if (!swipeRef.current.active) return;
                      swipeRef.current.active = false;
                      const dx = e.clientX - swipeRef.current.startX;
                      if (Math.abs(dx) < 40) return;
                      stepMobile(dx < 0 ? 1 : -1);
                    }}
                    onPointerCancel={() => {
                      swipeRef.current.active = false;
                    }}
                  >
                    <video
                      src={effectiveSelected.src}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-brand-navy/60">
              {autoplay && imgs.length > 1
                ? locale === "ar"
                  ? "عرض تلقائي للصور"
                  : "Auto slideshow"
                : locale === "ar"
                  ? "اختر صورة/فيديو"
                  : "Pick an image/video"}
            </p>
            <div className="flex items-center gap-2">
              {effectiveSelected?.kind === "image" ? (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="rounded-full border border-brand-navy/15 bg-white px-4 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-orange/40"
                >
                  {locale === "ar" ? "ملء الشاشة" : "Fullscreen"}
                </button>
              ) : null}
              {imgs.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setAutoplay((v) => !v)}
                  className="rounded-full border border-brand-navy/15 bg-white px-4 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-orange/40"
                >
                  {autoplay
                    ? locale === "ar"
                      ? "إيقاف العرض"
                      : "Stop"
                    : locale === "ar"
                      ? "تشغيل العرض"
                      : "Play"}
                </button>
              ) : null}
            </div>
          </div>

          {/* Mobile single cinematic strip (images + videos) */}
          <div className="mt-4 md:hidden">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-navy/60">
              {sideLabelImages} / {sideLabelVideos}
            </p>
            {mobileItems.length ? (
              <MobileStrip
                items={mobileItems}
                title={title}
                selected={effectiveSelected}
                onPick={choose}
              />
            ) : (
              <div className="text-xs font-semibold text-brand-navy/60">
                {locale === "ar"
                  ? "لا توجد صور أو فيديوهات"
                  : "No images or videos"}
              </div>
            )}
          </div>
        </div>

        {/* Right rail (images) — moves bottom -> top */}
        <div className="order-3 hidden md:block">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-navy/60">
            {sideLabelImages}
          </p>
          <Rail direction="up" className={mediaHeight}>
            {imgs.length ? (
              imgs.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => choose({ kind: "image", src })}
                  className="relative block aspect-[9/16] w-full overflow-hidden rounded-xl border border-brand-navy/10 bg-brand-navy/5"
                  aria-label="Image"
                >
                  <Image
                    src={src}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/55 to-transparent opacity-60" />
                </button>
              ))
            ) : (
              <EmptyTile label={locale === "ar" ? "لا توجد صور" : "No images"} />
            )}
          </Rail>
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && effectiveSelected?.kind === "image" ? (
          <motion.div
            key="fs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90"
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/15"
            >
              {locale === "ar" ? "إغلاق" : "Close"} (Esc)
            </button>

            <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-16">
              <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black">
                <Image
                  src={effectiveSelected.src}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {imgs.length ? (
                <div className="mt-4">
                  <div className="flex gap-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-3">
                    {imgs.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => choose({ kind: "image", src })}
                        className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition ${
                          src === effectiveSelected.src
                            ? "border-brand-orange"
                            : "border-white/10 hover:border-white/25"
                        }`}
                        aria-label="Thumbnail"
                      >
                        <Image
                          src={src}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function EmptyTile({ label }: { label: string }) {
  return (
    <div className="grid aspect-[9/16] w-full place-items-center rounded-xl border border-dashed border-brand-navy/20 bg-tg-cream/40">
      <p className="px-3 text-center text-xs font-semibold text-brand-navy/60">
        {label}
      </p>
    </div>
  );
}

function Rail({
  children,
  direction,
  className,
}: {
  children: React.ReactNode;
  direction: "up" | "down";
  className?: string;
}) {
  const items = Array.isArray(children) ? children : [children];
  const doubled = [...items, ...items];
  const anim =
    direction === "up"
      ? "tg-marquee-up 32s linear infinite"
      : "tg-marquee-down 34s linear infinite";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-white ${className || ""}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-white to-transparent" />

      <div
        className="grid gap-3 p-3"
        style={{
          animation: anim,
        }}
      >
        {/* Make items clickable by allowing pointer events on them */}
        {doubled.map((node, i) => (
          <div key={i} className="pointer-events-auto">
            {node}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes tg-marquee-up {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
        @keyframes tg-marquee-down {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function MobileStrip({
  items,
  title,
  selected,
  onPick,
}: {
  items: MobileItem[];
  title: string;
  selected: Selected | null;
  onPick: (s: Selected) => void;
}) {
  // Repeat enough times so the loop always looks continuous, even with few items
  const loopItems = useMemo(() => {
    const base = items.length ? items : [];
    const min = 16;
    const out: MobileItem[] = [];
    if (!base.length) return out;
    while (out.length < min) out.push(...base);
    return out;
  }, [items]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const pauseRef = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    const pxPerSec = 42;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = (now - last) / 1000;
      last = now;
      if (pauseRef.current) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

      const half = el.scrollWidth / 2;
      if (!half) return;
      el.scrollLeft += pxPerSec * dt;
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loopItems.length]);

  // Kickstart after layout so scrollWidth is non-zero on mobile
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Slight offset avoids some browsers reporting 0 scrollWidth until first scroll
    el.scrollLeft = 1;
  }, [loopItems.length]);

  function pauseAndResume() {
    pauseRef.current = true;
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      pauseRef.current = false;
    }, 900);
  }

  return (
    <div className="relative max-w-full overflow-hidden rounded-2xl border border-brand-navy/10 bg-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onTouchStart={pauseAndResume}
        onTouchMove={pauseAndResume}
        onPointerDown={pauseAndResume}
        onPointerMove={pauseAndResume}
      >
        {[...loopItems, ...loopItems].map((it, idx) => (
          <MobileThumb
            key={`${it.key}:${idx}`}
            item={it}
            title={title}
            selected={selected}
            onPick={(s) => {
              pauseAndResume();
              onPick(s);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MobileThumb({
  item,
  title,
  selected,
  onPick,
}: {
  item: MobileItem;
  title: string;
  selected: Selected | null;
  onPick: (s: Selected) => void;
}) {
  const isActive = selected?.kind === item.kind && selected?.src === item.src;
  return (
    <button
      type="button"
      onClick={() => onPick({ kind: item.kind, src: item.src })}
      className={`relative h-12 w-20 shrink-0 snap-start overflow-hidden rounded-xl border ${
        isActive ? "border-brand-orange" : "border-brand-navy/10"
      } ${item.kind === "video" ? "bg-black" : "bg-brand-navy/5"}`}
      aria-label={item.kind === "video" ? "Video" : "Image"}
    >
      {item.kind === "image" ? (
        <Image
          src={item.src}
          alt={title}
          fill
          className="object-cover"
          sizes="120px"
        />
      ) : (
        <>
          <video
            src={item.src}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-brand-navy">
            ▶
          </div>
        </>
      )}
    </button>
  );
}

