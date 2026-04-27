import { redirect } from "next/navigation";

/** Root `/` — middleware also locale-prefixes; this satisfies the App Router root page type. */
export default function RootPage() {
  redirect("/ar");
}
