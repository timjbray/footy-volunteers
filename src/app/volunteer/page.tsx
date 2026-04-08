import Image from "next/image";
import VolunteerForm from "./VolunteerForm";
import NavMenu from "../components/NavMenu";

export const metadata = {
  title: "Marby Lions - Volunteer Signup",
  description: "Sign up to help at Marby Lions match days",
};

export default async function VolunteerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { type } = await searchParams;
  const initialType = type === "match-day" || type === "bar" ? type : undefined;

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
            <p className="text-sm text-blue-200">Volunteer Signup</p>
          </div>
          <NavMenu />
        </div>
      </header>

      <main className="py-8 px-4">
        <VolunteerForm initialType={initialType} />
      </main>
    </div>
  );
}
