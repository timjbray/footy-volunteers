"use client";

import { useState, useCallback } from "react";

interface Slot {
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
  name: string;
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
  const [confirmClear, setConfirmClear] = useState<Slot | null>(null);

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
      setConfirmClear(slot);
    } else {
      setEditingSlot(slot.rowIndex);
      setNameInput("");
    }
  };

  const handleClear = async () => {
    if (!confirmClear) return;
    setSaving(true);
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: currentTab, rowIndex: confirmClear.rowIndex, name: "" }),
      });
      await fetchRound(currentTab);
    } finally {
      setSaving(false);
      setConfirmClear(null);
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
      {/* Confirm clear dialog */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Remove signup?
            </p>
            <p className="text-base text-gray-600 mb-6">
              Remove <span className="font-semibold">{confirmClear.volunteer}</span> from{" "}
              <span className="font-semibold">{confirmClear.role}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(null)}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={saving}
                className="flex-1 py-3 px-4 rounded-lg bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round selector */}
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => fetchRound(tab)}
              className={`px-4 py-2 rounded-full text-base font-medium whitespace-nowrap transition-colors ${
                tab === currentTab
                  ? "bg-marby-navy text-marby-gold"
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
        <h2 className="text-2xl font-bold text-marby-navy">{round.name}</h2>
        {(round.date || round.location) && (
          <p className="text-lg text-gray-600 mt-1">
            {[round.date, round.location].filter(Boolean).join(" — ")}
          </p>
        )}
        <p className="text-base mt-2">
          <span className="font-semibold text-green-700">{filledCount}</span>
          <span className="text-gray-500">/{totalCount} filled</span>
        </p>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500 text-lg">Loading...</div>
      )}

      {/* Games */}
      {!loading &&
        round.games.map((game) => {
          const gameFilledCount = game.slots.filter((s) => s.volunteer).length;
          const gameTotalCount = game.slots.length;
          const allFilled = gameFilledCount === gameTotalCount;

          return (
            <div key={`${game.game}-${game.time}`} className="mb-8">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-lg font-semibold text-marby-navy">
                  {game.time} &mdash; {game.game}
                </h3>
                <span
                  className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                    allFilled
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {gameFilledCount}/{gameTotalCount}
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {game.slots.map((slot) => (
                  <div
                    key={slot.rowIndex}
                    className={`flex items-center justify-between px-4 py-4 border-b last:border-b-0 transition-colors ${
                      slot.volunteer
                        ? "bg-green-50"
                        : "bg-white hover:bg-indigo-50 cursor-pointer active:bg-indigo-100"
                    }`}
                    onClick={() =>
                      editingSlot !== slot.rowIndex && handleSlotClick(slot)
                    }
                  >
                    <span className="text-base font-medium text-gray-700 min-w-0 mr-3">
                      {slot.role}
                    </span>

                    {editingSlot === slot.rowIndex ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit(slot.rowIndex);
                        }}
                        className="flex gap-2 items-center shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Your name"
                          autoFocus
                          className="border border-gray-300 rounded-lg px-3 py-2 text-base w-36 focus:outline-none focus:ring-2 focus:ring-marby-navy"
                        />
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-marby-navy text-marby-gold text-base px-4 py-2 rounded-lg hover:bg-marby-navy-light disabled:opacity-50"
                        >
                          {saving ? "..." : "OK"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSlot(null)}
                          className="text-gray-400 hover:text-gray-600 text-lg p-1"
                        >
                          ✕
                        </button>
                      </form>
                    ) : slot.volunteer ? (
                      <span className="text-base text-green-700 font-medium shrink-0">
                        {slot.volunteer}
                      </span>
                    ) : (
                      <span className="text-base text-gray-400 italic shrink-0">
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
