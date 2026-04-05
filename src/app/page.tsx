import SignupGrid from "./components/SignupGrid";

async function getInitialData() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/rounds`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Home() {
  const data = await getInitialData();

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <h1 className="text-center text-xl font-bold text-gray-900">
          🏉 Match Day Volunteers
        </h1>
      </header>

      <main className="py-6 px-4">
        {data?.round ? (
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
