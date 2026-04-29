import Image from "next/image";
import { Link } from "@/i18n/routing";

export function Logo({
  locale,
  logoUrl,
}: {
  locale: string;
  logoUrl?: string;
}) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" locale={locale}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="TownGate"
          width={220}
          height={64}
          className="h-10 w-auto md:h-14 lg:h-16"
          priority
        />
      ) : (
        <Image
          src="/brand/towngate-mark.svg"
          alt="TownGate"
          width={160}
          height={40}
          className="h-9 w-auto"
          priority
        />
      )}
    </Link>
  );
}
