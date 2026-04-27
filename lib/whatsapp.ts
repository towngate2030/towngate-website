export function getWhatsAppE164(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_E164?.replace(/\D/g, "") || "966593053792";
}

export function getWhatsAppUrl(prefillMessage: string): string {
  const num = getWhatsAppE164();
  const text = encodeURIComponent(prefillMessage);
  return `https://wa.me/${num}?text=${text}`;
}
