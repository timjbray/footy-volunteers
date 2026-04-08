import Image from "next/image";
import { getRoundTabs, getLatestRoundTab, getRoundData } from "@/lib/sheets";
import SignupGrid from "./components/SignupGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data = null;

  try {
    const [tabs, latestTab] = await Promise.all([
      getRoundTabs(),
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
    <div className="min-h-full bg-[var(--background)]">
      <header className="bg-marby-navy py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Marby Lions FC"
            width={56}
            height={63}
            className="shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold text-marby-gold tracking-wide">
              Marby Lions
            </h1>
            <p className="text-sm text-blue-200">Match Day Volunteers</p>
          </div>
        </div>
      </header>

      <main className="py-6 px-4">
        {data ? (
          <SignupGrid initialData={data} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No rounds set up yet</p>
            <p className="text-sm">
              Add a tab to the Google Sheet with columns: Game, Time, Role,
              Volunteer
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
