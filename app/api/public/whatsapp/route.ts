import { NextResponse } from "next/server";
import { getWhatsAppContacts } from "@/lib/cms";

export async function GET() {
  const contacts = await getWhatsAppContacts();
  return NextResponse.json({ contacts });
}

