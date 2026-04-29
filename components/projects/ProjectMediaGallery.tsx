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

  const [selected, setSelected] = useState<Selected | null>(() => {
    if (imgs[0]) return { kind: "image", src: imgs[0] };
    if (vids[0]) return { kind: "video", src: vids[0] };
    return null;
  });

  // Auto slideshow for images until user selects something.
  const [autoplay, setAutoplay] = useState(true);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!autoplay) return;
    if (imgs.length < 2) return;

    const id = window.setInterval(() => {
      idxRef.current = (idxRef.current + 1) % imgs.length;
      setSelected({ kind: "image", src: imgs[idxRef.current] });
    }, 3500);
    return () => window.clearInterval(id);
  }, [autoplay, imgs]);

  function choose(sel: Selected) {
    setAutoplay(false);
    setSelected(sel);
  }

  const empty = !selected;
  const sideLabelImages = locale === "ar" ? "صور" : "Images";
  const sideLabelVideos = locale === "ar" ? "فيديو" : "Videos";

  return (
    <section className="rounded-3xl border border-brand-navy/10 bg-white p-4 shadow-sm md:p-6">
      <div className="grid gap-4 md:grid-cols-[160px_1fr_160px] md:gap-6">
        {/* Left rail (videos) — moves top -> bottom */}
        <div className="order-2 md:order-1">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-navy/60">
            {sideLabelVideos}
          </p>
          <Rail direction="down">
            {vids.length ? (
              vids.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => choose({ kind: "video", src: v })}
                  className="group relative block aspect-[9/16] w-full overflow-hidden rounded-xl border border-brand-navy/10 bg-black/90"
                  aria-label="Video"
                >
                  <video
                    src={v}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
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
          <div className="relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-brand-navy/5">
            <div className="relative aspect-[16/10] w-full">
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
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.995 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute inset-0"
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
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute inset-0 bg-black"
                  >
                    <video
                      src={selected.src}
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

        {/* Right rail (images) — moves bottom -> top */}
        <div className="order-3">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-navy/60">
            {sideLabelImages}
          </p>
          <Rail direction="up">
            {imgs.length ? (
              imgs.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => choose({ kind: "image", src })}
                  className="group relative block aspect-[9/16] w-full overflow-hidden rounded-xl border border-brand-navy/10 bg-brand-navy/5"
                  aria-label="Image"
                >
                  <Image
                    src={src}
                    alt={title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/55 to-transparent opacity-60 transition group-hover:opacity-40" />
                </button>
              ))
            ) : (
              <EmptyTile label={locale === "ar" ? "لا توجد صور" : "No images"} />
            )}
          </Rail>
        </div>
      </div>
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
}: {
  children: React.ReactNode;
  direction: "up" | "down";
}) {
  const items = Array.isArray(children) ? children : [children];
  const doubled = [...items, ...items];
  const anim =
    direction === "up" ? "tg-marquee-up 16s linear infinite" : "tg-marquee-down 18s linear infinite";

  return (
    <div className="relative h-[520px] overflow-hidden rounded-2xl border border-brand-navy/10 bg-white">
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

