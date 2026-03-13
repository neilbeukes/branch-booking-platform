import { useState } from "react";
import { Link } from "react-router-dom";

const navLinkClass =
  "inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition no-underline";

export function LayoutActionItems() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-end min-w-0">
      <div className="flex items-center gap-4">
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
        <Link to="/manage" className={navLinkClass}>
          Manage my booking
        </Link>
        <Link to="/bookings" className={navLinkClass}>
          Bookings
        </Link>
      </nav>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="md:hidden p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        aria-expanded={menuOpen}
        aria-label="Toggle menu"
      >
        <span className="sr-only">{menuOpen ? "Close" : "Open"} menu</span>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          {menuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      </div>
      {/* Mobile nav (collapsible) */}
      {menuOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2 w-full">
          <Link
            to="/manage"
            className={`${navLinkClass} block w-full text-center`}
            onClick={() => setMenuOpen(false)}
          >
            Manage my booking
          </Link>
          <Link
            to="/bookings"
            className={`${navLinkClass} block w-full text-center`}
            onClick={() => setMenuOpen(false)}
          >
            Bookings
          </Link>
        </nav>
      )}
    </div>
  );
}
