import { getRoundTabs, getLatestRoundTab, getRoundData } from "@/lib/sheets";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const tab = request.nextUrl.searchParams.get("tab");

  try {
    if (tab) {
      const data = await getRoundData(tab);
      if (!data) {
        return Response.json({ error: "Round not found" }, { status: 404 });
      }
      return Response.json(data);
    }

    // No tab specified — return latest round + list of all tabs
    const [tabs, latestTab] = await Promise.all([
      getRoundTabs(),
      getLatestRoundTab(),
    ]);

    if (!latestTab) {
      return Response.json({ error: "No rounds found" }, { status: 404 });
    }

    const data = await getRoundData(latestTab);
    return Response.json({ tabs, currentTab: latestTab, round: data });
  } catch (error) {
    console.error("Failed to fetch round data:", error);
    return Response.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
