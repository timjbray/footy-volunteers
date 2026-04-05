"use client";

import { useState, useCallback } from "react";

interface Slot {
  round: string;
  date: string;
  location: string;
  game: string;
  time: string;
  role: string;
  volunteer: string;
  rowIndex: number;
}

interface GameData {
  game: string;
  time: string;
  slots: Slot[];
}

interface RoundData {
  round: string;
  date: string;
  location: string;
  games: GameData[];
}

interface SignupGridProps {
  initialData: {
    tabs: string[];
    currentTab: string;
    round: RoundData;
  };
}

export default function SignupGrid({ initialData }: SignupGridProps) {
  const [tabs] = useState(initialData.tabs);
  const [currentTab, setCurrentTab] = useState(initialData.currentTab);
  const [round, setRound] = useState<RoundData>(initialData.round);
  const [loading, setLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRound = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rounds?tab=${encodeURIComponent(tab)}`);
      const data = await res.json();
      setRound(data);
      setCurrentTab(tab);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSlotClick = (slot: Slot) => {
    if (saving) return;
    if (slot.volunteer) {
      // Clear the slot
      handleClear(slot);
    } else {
      setEditingSlot(slot.rowIndex);
      setNameInput("");
    }
  };

  const handleClear = async (slot: Slot) => {
    setSaving(true);
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: currentTab, rowIndex: slot.rowIndex, name: "" }),
      });
      await fetchRound(currentTab);
    } finally {
      setSaving(false);
      setEditingSlot(null);
    }
  };

  const handleSubmit = async (rowIndex: number) => {
    if (!nameInput.trim()) {
      setEditingSlot(null);
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: currentTab, rowIndex, name: nameInput.trim() }),
      });
      await fetchRound(currentTab);
    } finally {
      setSaving(false);
      setEditingSlot(null);
      setNameInput("");
    }
  };

  const filledCount = round.games.reduce(
    (acc, g) => acc + g.slots.filter((s) => s.volunteer).length,
    0
  );
  const totalCount = round.games.reduce((acc, g) => acc + g.slots.length, 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Round selector */}
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => fetchRound(tab)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                tab === currentTab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Round header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{round.round}</h2>
        <p className="text-gray-600 mt-1">
          {round.date} &mdash; {round.location}
        </p>
        <p className="text-sm mt-2">
          <span className="font-semibold text-green-700">{filledCount}</span>
          <span className="text-gray-500">/{totalCount} filled</span>
        </p>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      )}

      {/* Games */}
      {!loading &&
        round.games.map((game) => {
          const gameFilledCount = game.slots.filter((s) => s.volunteer).length;
          const gameTotalCount = game.slots.length;
          const allFilled = gameFilledCount === gameTotalCount;

          return (
            <div key={`${game.game}-${game.time}`} className="mb-6">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-semibold text-gray-800">
                  {game.time} &mdash; {game.game}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    allFilled
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {gameFilledCount}/{gameTotalCount}
                </span>
              </div>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {game.slots.map((slot) => (
                  <div
                    key={slot.rowIndex}
                    className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-colors ${
                      slot.volunteer
                        ? "bg-green-50"
                        : "bg-white hover:bg-blue-50 cursor-pointer"
                    }`}
                    onClick={() =>
                      editingSlot !== slot.rowIndex && handleSlotClick(slot)
                    }
                  >
                    <span className="text-sm font-medium text-gray-700 w-40">
                      {slot.role}
                    </span>

                    {editingSlot === slot.rowIndex ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit(slot.rowIndex);
                        }}
                        className="flex gap-2 items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Your name"
                          autoFocus
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? "..." : "OK"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSlot(null)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          ✕
                        </button>
                      </form>
                    ) : slot.volunteer ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-700 font-medium">
                          {slot.volunteer}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClear(slot);
                          }}
                          className="text-gray-300 hover:text-red-500 text-xs transition-colors"
                          title="Remove signup"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Tap to sign up
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
