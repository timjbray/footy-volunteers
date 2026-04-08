"use client";

import { useState } from "react";

type VolunteerType = "match-day" | "bar" | null;

const OPTIONS = [
  {
    type: "match-day" as const,
    title: "Match Day Helper",
    description:
      "Happy to help on match days for any role — set up / pack up, timekeeper, match day official, ground manager, etc.",
  },
  {
    type: "bar" as const,
    title: "Bar Volunteer",
    description:
      "I have my RSA and am happy to work behind the bar on match days.",
  },
];

export default function VolunteerForm({
  initialType,
}: {
  initialType?: "match-day" | "bar";
}) {
  const [selected, setSelected] = useState<VolunteerType>(initialType ?? null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !name.trim() || !mobile.trim() || !email.trim()) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selected, name, mobile, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sign up");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    const option = OPTIONS.find((o) => o.type === selected)!;
    return (
      <div className="w-full max-w-md mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="text-4xl mb-4">&#10003;</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Thanks, {name}!
          </h2>
          <p className="text-green-700 text-lg">
            You&apos;re signed up as a <strong>{option.title}</strong>.
            We&apos;ll be in touch when we need helpers.
          </p>
          <button
            onClick={() => {
              setDone(false);
              setSelected(null);
              setName("");
              setMobile("");
              setEmail("");
            }}
            className="mt-6 text-marby-navy underline text-base"
          >
            Sign up another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-center text-gray-600 mb-6 text-lg">
        Pick how you&apos;d like to help, then fill in your details.
      </p>

      {/* Option cards */}
      <div className="space-y-4 mb-8">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => setSelected(opt.type)}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
              selected === opt.type
                ? "border-marby-navy bg-indigo-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                  selected === opt.type
                    ? "border-marby-navy bg-marby-navy"
                    : "border-gray-300"
                }`}
              >
                {selected === opt.type && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {opt.title}
                </div>
                <p className="text-base text-gray-600 mt-1">
                  {opt.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Form - shown after selection */}
      {selected && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-marby-navy focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mobile
            </label>
            <input
              id="mobile"
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="04xx xxx xxx"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-marby-navy focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-marby-navy focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim() || !mobile.trim() || !email.trim()}
            className="w-full bg-marby-navy text-marby-gold text-lg font-bold py-4 rounded-xl hover:bg-marby-navy-light disabled:opacity-50 transition-colors"
          >
            {saving ? "Signing up..." : "Sign me up!"}
          </button>
        </form>
      )}
    </div>
  );
}
