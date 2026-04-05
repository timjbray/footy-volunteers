import { signUp, clearSlot } from "@/lib/sheets";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tab, rowIndex, name } = await request.json();

    if (!tab || !rowIndex) {
      return Response.json(
        { error: "Missing tab or rowIndex" },
        { status: 400 }
      );
    }

    if (name) {
      await signUp(tab, rowIndex, name.trim());
    } else {
      await clearSlot(tab, rowIndex);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to update signup:", error);
    return Response.json(
      { error: "Failed to update signup" },
      { status: 500 }
    );
  }
}
