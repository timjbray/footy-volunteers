import { getSheetTabs, getLatestRoundTab, getRoundData } from "@/lib/sheets";
import SignupGrid from "./components/SignupGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data = null;

  try {
    const [tabs, latestTab] = await Promise.all([
      getSheetTabs(),
      getLatestRoundTab(),
    ]);

    if (latestTab) {
      const round = await getRoundData(latestTab);
      if (round) {
        data = { tabs, currentTab: latestTab, round };
      }
    }
  } catch (error) {
    console.error("Failed to fetch round data:", error);
  }

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <h1 className="text-center text-xl font-bold text-gray-900">
          🏉 Match Day Volunteers
        </h1>
      </header>

      <main className="py-6 px-4">
        {data ? (
          <SignupGrid initialData={data} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No rounds set up yet</p>
            <p className="text-sm">
              Add a tab to the Google Sheet with columns: Round, Date, Location,
              Game, Time, Role, Volunteer
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
