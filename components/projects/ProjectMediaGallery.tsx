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

  const empty = !selected;
  const sideLabelImages = locale === "ar" ? "صور" : "Images";
  const sideLabelVideos = locale === "ar" ? "فيديو" : "Videos";

  const mobileItems = useMemo<MobileItem[]>(() => {
    const items: MobileItem[] = [];
    for (const src of imgs) items.push({ kind: "image", src, key: `i:${src}` });
    for (const src of vids) items.push({ kind: "video", src, key: `v:${src}` });
    return items;
  }, [imgs, vids]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  return (
    <section className="w-full max-w-full rounded-3xl border border-brand-navy/10 bg-white p-4 shadow-sm md:p-6">
      <div className="grid gap-4 md:grid-cols-[160px_1fr_160px] md:gap-6">
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
            className={`relative w-full max-w-full overflow-hidden rounded-2xl border border-brand-navy/10 bg-brand-navy/5 ${mediaHeight}`}
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
                ) : selected.kind === "image" ? (
                  <motion.div
                    key={`img:${selected.src}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 will-change-[opacity]"
                  >
                    <Image
                      src={selected.src}
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
                    key={`vid:${selected.src}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute inset-0 bg-black/95 will-change-[opacity]"
                  >
                    <video
                      src={selected.src}
                      controls
                      playsInline
                      className="h-full w-full object-cover"
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
              {selected?.kind === "image" ? (
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
                selected={selected}
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
        {isFullscreen && selected?.kind === "image" ? (
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
                  src={selected.src}
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
                          src === selected.src
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
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

      <div className="flex gap-3 p-3" style={{ animation: "tg-marquee-x 28s linear infinite" }}>
        {doubled.map((it, idx) => {
          const isActive =
            selected?.kind === it.kind && selected?.src === it.src;
          return (
            <button
              key={`${it.key}:${idx}`}
              type="button"
              onClick={() => onPick({ kind: it.kind, src: it.src })}
              className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border ${
                isActive ? "border-brand-orange" : "border-brand-navy/10"
              } ${it.kind === "video" ? "bg-black" : "bg-brand-navy/5"}`}
              aria-label={it.kind === "video" ? "Video" : "Image"}
            >
              {it.kind === "image" ? (
                <Image
                  src={it.src}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <>
                  <video
                    src={it.src}
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
        })}
      </div>

      <style jsx>{`
        @keyframes tg-marquee-x {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

