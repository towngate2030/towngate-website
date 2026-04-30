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
  // Slightly larger by default across mobile + desktop
  const cls =
    imgClassName ??
    (logoUrl
      ? "h-12 w-auto md:h-[72px] lg:h-[80px]"
      : "h-10 w-auto md:h-[64px] lg:h-[72px]");

  return (
    <Link
      href="/"
      className="tg-logo flex shrink-0 items-center gap-2"
      locale={locale}
      aria-label="TownGate"
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="TownGate"
          width={220}
          height={64}
          className={`tg-logo__img ${cls}`}
          priority
        />
      ) : (
        <Image
          src="/brand/towngate-mark.svg"
          alt="TownGate"
          width={160}
          height={40}
          className={`tg-logo__img ${cls}`}
          priority
        />
      )}
    </Link>
  );
}
