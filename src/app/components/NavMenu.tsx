"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-blue-200 hover:text-marby-gold hover:bg-white/10 transition-colors"
        aria-label="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 border-b border-gray-100"
          >
            Rounds
          </Link>
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Volunteer Signup
            </p>
          </div>
          <Link
            href="/volunteer?type=match-day"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50"
          >
            Match Day Helper
          </Link>
          <Link
            href="/volunteer?type=bar"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-50"
          >
            Bar Volunteer
          </Link>
        </div>
      )}
    </div>
  );
}
