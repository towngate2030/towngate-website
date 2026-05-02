"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";

/**
 * Single Sanity logo in the header — no decorative CSS (no shadow/filter classes)
 * so browsers don’t paint a faint duplicate next to the image.
 */
export function Logo({
  locale,
  logoUrl,
  imgClassName,
}: {
  locale: string;
  logoUrl?: string;
  imgClassName?: string;
}) {
  const url = String(logoUrl || "").trim();
  if (!url) return null;

  const cls =
    imgClassName ?? "h-12 w-auto md:h-[72px] lg:h-[80px]";

  return (
    <Link
      href="/"
      translate="no"
      className="inline-flex shrink-0 items-center"
      locale={locale}
      aria-label="Home"
    >
      <Image
        src={url}
        alt=""
        width={220}
        height={64}
        className={`max-h-[80px] max-w-[min(72vw,280px)] object-contain object-start ${cls}`}
        priority
      />
    </Link>
  );
}
