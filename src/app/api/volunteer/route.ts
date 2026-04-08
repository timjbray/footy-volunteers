import { NextRequest, NextResponse } from "next/server";
import { appendVolunteer } from "@/lib/sheets";

const SHEET_NAMES: Record<string, string> = {
  "match-day": "Match Day Helpers",
  bar: "Bar Volunteers",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, name, mobile, email } = body;

  if (!type || !name?.trim() || !mobile?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const sheetName = SHEET_NAMES[type];
  if (!sheetName) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  await appendVolunteer(sheetName, {
    name: name.trim(),
    mobile: mobile.trim(),
    email: email.trim(),
  });

  return NextResponse.json({ ok: true });
}
