"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  alt?: string;
};

function isValidUrl(s: string) {
  const v = String(s || "").trim();
  return v.startsWith("http://") || v.startsWith("https://");
}

export function MobileProjectMediaGallery({
  title,
  images,
  videos,
}: {
  title: string;
  images: string[];
  videos: string[];
}) {
  const mediaItems = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];

    const imgs = images.filter(isValidUrl).slice(0, 10);
    const vids = videos.filter(isValidUrl).slice(0, 10);

    for (let i = 0; i < imgs.length; i++) {
      items.push({
        id: `img:${i}:${imgs[i]}`,
        type: "image",
        url: imgs[i],
        alt: title,
      });
    }

    for (let i = 0; i < vids.length; i++) {
      items.push({
        id: `vid:${i}:${vids[i]}`,
        type: "video",
        url: vids[i],
        alt: title,
      });
    }

    return items;
  }, [images, videos, title]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState<null | { type: "image" | "video"; url: string }>(
    null,
  );

  const interactTimer = useRef<number | null>(null);
  const thumbRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const failedIds = useRef<Set<string>>(new Set());
  const stripRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const activeItem = mediaItems[activeIndex] ?? null;

  // Initial state: first image if any, else first item.
  useEffect(() => {
    if (!mediaItems.length) return;
    const firstImageIdx = mediaItems.findIndex((m) => m.type === "image");
    const next = firstImageIdx >= 0 ? firstImageIdx : 0;
    setActiveIndex(next);
    setIsVideoPlaying(false);
  }, [mediaItems]);

  // Stop video when switching items
  useEffect(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }, [activeIndex]);

  // Auto slideshow for images only (every 4 seconds)
  useEffect(() => {
    if (!activeItem) return;
    if (activeItem.type !== "image") return;
    if (isVideoPlaying) return;
    if (isUserInteracting) return;

    const id = window.setInterval(() => {
      if (!mediaItems.length) return;

      const total = mediaItems.length;
      let next = activeIndex;
      for (let step = 1; step <= total; step++) {
        const idx = (activeIndex + step) % total;
        const it = mediaItems[idx];
        if (it?.type === "image" && !failedIds.current.has(it.id)) {
          next = idx;
          break;
        }
      }
      if (next !== activeIndex) setActiveIndex(next);
    }, 4000);

    return () => window.clearInterval(id);
  }, [activeIndex, activeItem, isUserInteracting, isVideoPlaying, mediaItems]);

  function markInteractingBriefly() {
    setIsUserInteracting(true);
    if (interactTimer.current) window.clearTimeout(interactTimer.current);
    interactTimer.current = window.setTimeout(() => {
      setIsUserInteracting(false);
    }, 700);
  }

  // Duplicate the list visually for seamless loop.
  const loopItems = useMemo(() => {
    const base = mediaItems;
    if (base.length <= 1) return base;
    // If content is short, repeat more times to ensure it's wider than the screen.
    if (base.length < 6) return [...base, ...base, ...base];
    return [...base, ...base];
  }, [mediaItems]);

  // Auto-scroll with requestAnimationFrame + scrollLeft reset.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || mediaItems.length <= 1) return;

    const speed = 0.45; // 0.35–0.6 px/frame

    const animate = () => {
      if (!isPausedRef.current && strip) {
        if (!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
          strip.scrollLeft += speed;
          const halfScrollWidth = strip.scrollWidth / 2;
          if (strip.scrollLeft >= halfScrollWidth) {
            strip.scrollLeft = 0;
          }
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mediaItems]);

  function pauseAutoLoop() {
    isPausedRef.current = true;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  function resumeAutoLoopAfterDelay() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      isPausedRef.current = false;
    }, 3000);
  }

  function setActiveFromThumb(idx: number) {
    setActiveIndex(idx);
    setIsVideoPlaying(false);
    markInteractingBriefly();

    const it = mediaItems[idx];
    if (!it) return;
    const el = thumbRefs.current.get(it.id);
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function onMainImageError(id: string) {
    failedIds.current.add(id);
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[mobile-gallery] image failed", id);
    }
    // Advance to next valid media item
    if (!mediaItems.length) return;
    for (let step = 1; step <= mediaItems.length; step++) {
      const idx = (activeIndex + step) % mediaItems.length;
      const it = mediaItems[idx];
      if (it && !failedIds.current.has(it.id)) {
        setActiveIndex(idx);
        return;
      }
    }
  }

  if (!mediaItems.length) {
    return (
      <div className="rounded-2xl border border-brand-navy/10 bg-white p-4 text-center text-sm font-semibold text-brand-navy/70">
        No media available
      </div>
    );
  }

  return (
    <div className="md:hidden">
      {/* Main display */}
      <div className="relative flex aspect-video w-full max-w-full items-center justify-center overflow-hidden rounded-2xl bg-[#111]">
        {/* Fullscreen button */}
        <button
          type="button"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/55"
          aria-label="Fullscreen"
          onClick={() => {
            if (!activeItem) return;
            if (activeItem.type === "video") {
              const v = videoRef.current;
              if (v && typeof (v as any).webkitEnterFullscreen === "function") {
                try {
                  (v as any).webkitEnterFullscreen();
                  return;
                } catch {
                  // fallback below
                }
              }
              if (v && typeof v.requestFullscreen === "function") {
                void v.requestFullscreen().catch(() => setFullscreen({ type: "video", url: activeItem.url }));
                return;
              }
              setFullscreen({ type: "video", url: activeItem.url });
              return;
            }
            setFullscreen({ type: "image", url: activeItem.url });
          }}
        >
          <span className="text-lg font-black leading-none">⤢</span>
        </button>

        {activeItem?.type === "image" ? (
          <img
            src={activeItem.url}
            alt={activeItem.alt ?? title}
            className="h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
            onError={() => onMainImageError(activeItem.id)}
          />
        ) : (
          <div className="relative h-full w-full bg-black">
            <video
              ref={videoRef}
              src={activeItem?.url}
              controls={isVideoPlaying}
              preload="metadata"
              playsInline
              className="h-full w-full object-contain"
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={() => setIsVideoPlaying(false)}
            />

            {!isVideoPlaying ? (
              <button
                type="button"
                className="absolute inset-0 grid place-items-center bg-black/10"
                aria-label="Play"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  setIsVideoPlaying(true);
                  v.controls = true;
                  void v.play().catch(() => {
                    setIsVideoPlaying(false);
                  });
                }}
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-orange text-white shadow-md shadow-brand-orange/25">
                  ▶
                </span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Cinematic strip */}
      <div
        ref={stripRef}
        className="thumbnail-strip mt-3 flex w-full gap-2 overflow-x-auto px-1 pb-2 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" as any }}
        onTouchStart={() => {
          markInteractingBriefly();
          pauseAutoLoop();
        }}
        onTouchEnd={() => {
          markInteractingBriefly();
          resumeAutoLoopAfterDelay();
        }}
        onTouchCancel={() => {
          markInteractingBriefly();
          resumeAutoLoopAfterDelay();
        }}
        onPointerDown={() => {
          markInteractingBriefly();
          pauseAutoLoop();
        }}
        onPointerUp={() => {
          markInteractingBriefly();
          resumeAutoLoopAfterDelay();
        }}
        onPointerCancel={() => {
          markInteractingBriefly();
          resumeAutoLoopAfterDelay();
        }}
        onMouseEnter={() => {
          pauseAutoLoop();
        }}
        onMouseLeave={() => {
          resumeAutoLoopAfterDelay();
        }}
      >
        {loopItems.map((it, rawIdx) => {
          const idx = mediaItems.length ? rawIdx % mediaItems.length : rawIdx;
          const isActive = idx === activeIndex;
          return (
            <button
              key={`${it.id}:${rawIdx}`}
              ref={(el) => {
                if (!el) return;
                thumbRefs.current.set(it.id, el);
              }}
              type="button"
              onClick={() => setActiveFromThumb(idx)}
              className={`thumbnail-item relative h-12 w-[72px] shrink-0 overflow-hidden rounded-[10px] border-2 bg-[#111] ${
                isActive
                  ? "border-brand-orange shadow-sm shadow-brand-orange/25"
                  : "border-transparent"
              }`}
              aria-label={it.type === "video" ? "Video" : "Image"}
            >
              {it.type === "image" ? (
                <img
                  src={it.url}
                  alt={it.alt ?? title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : it.thumbnailUrl ? (
                <img
                  src={it.thumbnailUrl}
                  alt={it.alt ?? title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <video
                  src={it.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover opacity-90"
                />
              )}

              {it.type === "video" ? (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[10px] font-extrabold text-brand-navy">
                    ▶
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Fullscreen overlay fallback (images + videos) */}
      {fullscreen ? (
        <div className="fixed inset-0 z-[80] bg-black/90">
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-black/40 px-4 py-2 text-sm font-extrabold text-white backdrop-blur"
            aria-label="Close fullscreen"
            onClick={() => setFullscreen(null)}
          >
            ✕
          </button>

          <div className="flex h-full w-full items-center justify-center px-3 py-16">
            {fullscreen.type === "image" ? (
              <img
                src={fullscreen.url}
                alt={title}
                className="max-h-full max-w-full object-contain"
                loading="eager"
                decoding="async"
              />
            ) : (
              <video
                src={fullscreen.url}
                controls
                playsInline
                preload="metadata"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

