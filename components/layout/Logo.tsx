import Image from "next/image";
import { Link } from "@/i18n/routing";

export function Logo({ locale }: { locale: string }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" locale={locale}>
      <Image
        src="/brand/towngate-mark.svg"
        alt="TownGate"
        width={160}
        height={40}
        className="h-9 w-auto"
        priority
      />
    </Link>
  );
}
