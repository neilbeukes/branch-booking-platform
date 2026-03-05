import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { appointments } from '../api/client';
import type { BookingListItem } from '../types';
import { BookingDetail } from '../components/BookingDetail';
import { AddToCalendar } from '../components/AddToCalendar';
import { Button } from '../components/Button';
import { FaArrowLeft } from 'react-icons/fa';

export function ManageBookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const refFromUrl = searchParams.get('reference')?.trim() ?? '';
  const emailFromUrl = searchParams.get('email')?.trim() ?? '';

  const [reference, setReference] = useState(refFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [booking, setBooking] = useState<BookingListItem | null>(null);
  const [loading, setLoading] = useState(!!(refFromUrl && emailFromUrl));
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const fetchBooking = async (ref: string, em: string) => {
    if (!ref || !em) return;
    setError(null);
    setLoading(true);
    try {
      const data = await appointments.getByReferenceAndEmail(ref, em);
      setBooking(data);
      setSearchParams({ reference: ref, email: em });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load booking');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refFromUrl && emailFromUrl) {
      setReference(refFromUrl);
      setEmail(emailFromUrl);
      fetchBooking(refFromUrl, emailFromUrl);
    }
  }, [refFromUrl, emailFromUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooking(reference, email);
  };

  const handleCancel = async () => {
    if (!booking || !email || cancelled) return;
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(true);
    setError(null);
    try {
      await appointments.cancel(booking.confirmationReference, email);
      setCancelled(true);
      setBooking((b) => (b ? { ...b, status: 'cancelled' } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const isCancelled = booking?.status === 'cancelled';

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition no-underline"
      >
        <FaArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="text-lg font-semibold text-gray-800">Manage my booking</h2>

      {!refFromUrl && !emailFromUrl ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-lg border border-gray-200 bg-white">
          <p className="text-sm text-gray-600">Enter your confirmation reference and email to view or cancel your booking.</p>
          <div>
            <label htmlFor="manage-ref" className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              id="manage-ref"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. CAP-ABC123"
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="manage-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="manage-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading}>View booking</Button>
        </form>
      ) : (
        <>
          {loading && <p className="text-gray-500">Loading…</p>}
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          {booking && !loading && (
            <div className="p-6 rounded-lg border border-gray-200 bg-white">
              <BookingDetail
                data={{
                  confirmationReference: booking.confirmationReference,
                  branch: booking.branch,
                  branchAddress: booking.branchAddress,
                  date: booking.date,
                  time: booking.time,
                  customerName: booking.customerName,
                  customerEmail: booking.customerEmail,
                  status: booking.status,
                }}
              >
                {!isCancelled && (
                  <>
                    <AddToCalendar
                      event={{
                        title: `Capitec appointment – ${booking.branch}`,
                        description: `Reference: ${booking.confirmationReference}. ${booking.customerName}.`,
                        location: [booking.branch, booking.branchAddress].filter(Boolean).join(', '),
                        start: booking.date,
                        startTime: booking.time,
                        durationMinutes: 60,
                        manageBookingUrl:
                          typeof window !== 'undefined' && email
                            ? `${window.location.origin}/manage?reference=${encodeURIComponent(booking.confirmationReference)}&email=${encodeURIComponent(email)}`
                            : undefined,
                      }}
                      className="pt-4 border-t border-gray-100"
                    />
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <Button variant="primary" onClick={handleCancel} disabled={cancelling}>
                        {cancelling ? 'Cancelling…' : 'Cancel booking'}
                      </Button>
                      <Link to={`/?edit=${encodeURIComponent(booking.confirmationReference)}&email=${encodeURIComponent(email)}`}>
                        <Button variant="secondary">Edit / reschedule</Button>
                      </Link>
                    </div>
                  </>
                )}
                {isCancelled && <p className="pt-4 border-t border-gray-100 text-sm text-amber-700">This booking has been cancelled.</p>}
              </BookingDetail>
            </div>
          )}
        </>
      )}
    </div>
  );
}
