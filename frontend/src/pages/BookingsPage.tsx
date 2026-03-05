import { useQuery } from '@tanstack/react-query';
import { appointments } from '../api/client';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export function BookingsPage() {
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['appointments', 'list'],
    queryFn: () => appointments.list(),
  });

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading bookings…</div>;
  if (error) return <div className="py-8 text-center text-red-600">Failed to load bookings.</div>;

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition no-underline"
      >
        <FaArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="text-lg font-semibold text-gray-800">All bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-sm">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Reference</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Branch</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Address</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Time</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.confirmationReference} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-gray-900">{b.confirmationReference}</td>
                  <td className="px-4 py-3 text-gray-900">{b.branch}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-gray-600" title={b.branchAddress}>{b.branchAddress}</td>
                  <td className="px-4 py-3 text-gray-900">{b.date}</td>
                  <td className="px-4 py-3 text-gray-900">{b.time}</td>
                  <td className="px-4 py-3 text-gray-900">{b.customerName}</td>
                  <td className="px-4 py-3 text-gray-900">{b.customerPhone ?? '—'}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-gray-900" title={b.customerEmail}>{b.customerEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{b.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
