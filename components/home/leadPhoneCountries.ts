/** Dial codes shown in the hero lead form (flag emoji + E.164 prefix). */
export const LEAD_PHONE_COUNTRIES = [
  { dial: "+20", flag: "🇪🇬", label: "EG" },
  { dial: "+966", flag: "🇸🇦", label: "SA" },
  { dial: "+971", flag: "🇦🇪", label: "AE" },
  { dial: "+965", flag: "🇰🇼", label: "KW" },
  { dial: "+974", flag: "🇶🇦", label: "QA" },
  { dial: "+973", flag: "🇧🇭", label: "BH" },
  { dial: "+968", flag: "🇴🇲", label: "OM" },
  { dial: "+962", flag: "🇯🇴", label: "JO" },
  { dial: "+961", flag: "🇱🇧", label: "LB" },
  { dial: "+1", flag: "🇺🇸", label: "US" },
] as const;

export const DEFAULT_PHONE_DIAL = "+20";

/** Builds one international-style phone string for the API (e.g. +2010xxxxxxxx). */
export function combineLeadPhone(dial: string, localRaw: string): string {
  let digits = localRaw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  const prefix = dial.startsWith("+") ? dial : `+${dial}`;
  return digits ? `${prefix}${digits}` : "";
}
