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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState<null | { type: "image" | "video"; url: string }>(
    null,
  );

  const interactTimer = useRef<number | null>(null);
  const thumbRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const failedIds = useRef<Set<string>>(new Set());
  const stripResumeTimer = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const firstSetRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const [groupCount, setGroupCount] = useState(4);

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

  function markInteractingBriefly() {
    if (interactTimer.current) window.clearTimeout(interactTimer.current);
    interactTimer.current = window.setTimeout(() => {}, 50);
  }

  function pauseStrip() {
    isPausedRef.current = true;
    if (stripResumeTimer.current) window.clearTimeout(stripResumeTimer.current);
    stripResumeTimer.current = null;
  }

  function resumeStripAfterDelay() {
    if (stripResumeTimer.current) window.clearTimeout(stripResumeTimer.current);
    stripResumeTimer.current = window.setTimeout(() => {
      isPausedRef.current = false;
    }, 3000);
  }

  // Ensure repeated groups are wide enough (>= 3x viewport width)
  useEffect(() => {
    const strip = stripRef.current;
    const first = firstSetRef.current;
    if (!strip || !first) return;
    if (mediaItems.length <= 1) {
      setGroupCount(1);
      return;
    }

    const measure = () => {
      const firstW = first.offsetWidth;
      const vw = strip.clientWidth;
      if (!firstW || !vw) return;
      const needed = Math.max(4, Math.ceil((vw * 3) / firstW) + 1);
      setGroupCount(needed);
    };

    // measure now + after layout
    measure();
    const id = window.setTimeout(measure, 0);
    return () => window.clearTimeout(id);
  }, [mediaItems]);

  // rAF auto-loop: scrollLeft += speed, and when >= firstSetWidth, subtract it
  useEffect(() => {
    const strip = stripRef.current;
    const first = firstSetRef.current;
    if (!strip || !first || mediaItems.length <= 1) return;

    const speed = 0.45;

    const animate = () => {
      if (!isPausedRef.current) {
        if (!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
          strip.scrollLeft += speed;
          const firstSetWidth = first.offsetWidth;
          if (firstSetWidth > 0 && strip.scrollLeft >= firstSetWidth) {
            strip.scrollLeft -= firstSetWidth;
          }
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mediaItems, groupCount]);

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
        className="mt-3 flex w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" as any }}
        onTouchStart={() => {
          markInteractingBriefly();
          pauseStrip();
        }}
        onTouchEnd={() => {
          markInteractingBriefly();
          resumeStripAfterDelay();
        }}
        onTouchCancel={() => {
          markInteractingBriefly();
          resumeStripAfterDelay();
        }}
        onPointerDown={() => {
          markInteractingBriefly();
          pauseStrip();
        }}
        onPointerUp={() => {
          markInteractingBriefly();
          resumeStripAfterDelay();
        }}
        onPointerCancel={() => {
          markInteractingBriefly();
          resumeStripAfterDelay();
        }}
        onMouseEnter={pauseStrip}
        onMouseLeave={resumeStripAfterDelay}
      >
        <div className="flex w-max gap-2 pe-2">
          {Array.from({ length: Math.max(1, groupCount) }).map((_, groupIdx) => (
            <div
              key={groupIdx}
              ref={groupIdx === 0 ? firstSetRef : undefined}
              className="flex gap-2 shrink-0"
            >
              {mediaItems.map((it, idx) => {
                const isActive = idx === activeIndex;
                const repeatedIndex = groupIdx * mediaItems.length + idx;
                const realIndex = mediaItems.length ? repeatedIndex % mediaItems.length : idx;
                return (
                  <button
                    key={`${it.id}:${groupIdx}:${idx}`}
                    type="button"
                    onClick={() => setActiveFromThumb(realIndex)}
                    className={`relative h-12 w-[72px] shrink-0 overflow-hidden rounded-[10px] border-2 bg-[#111] ${
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
          ))}
        </div>
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

