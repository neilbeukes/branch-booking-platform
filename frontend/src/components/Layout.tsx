import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  /** Use wider max-width (e.g. for bookings table) */
  wide?: boolean;
}

export function Layout({ children, wide = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
      <Link to="/" className="inline-block no-underline">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Capitec_Bank_logo.svg/1280px-Capitec_Bank_logo.svg.png" 
          alt="Branch Booking" className="h-10" />
      </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/manage"
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition no-underline"
          >
            Manage my booking
          </Link>
          <Link
            to="/bookings"
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition no-underline"
          >
            Bookings
          </Link>
        </div>
      </header>
      <main className={`mx-auto py-8 px-6 ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {children}
      </main>
    </div>
  );
}
