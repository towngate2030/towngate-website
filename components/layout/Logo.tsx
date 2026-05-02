import Image from "next/image";
import { Link } from "@/i18n/routing";

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
      className="tg-logo flex shrink-0 items-center gap-2"
      locale={locale}
      aria-label="Home"
    >
      <Image
        src={url}
        alt=""
        width={220}
        height={64}
        className={`tg-logo__img max-h-[80px] max-w-[min(72vw,280px)] object-contain object-start ${cls}`}
        priority
      />
    </Link>
  );
}
