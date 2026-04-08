import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marby Lions - Match Day Volunteers",
  description: "Sign up for weekly match day volunteer roles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
