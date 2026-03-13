import { useState } from "react";
import { Button } from "../../../components/Button";

interface ManageBookingLookupFormProps {
  onSubmit: (reference: string, email: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function ManageBookingLookupForm({
  onSubmit,
  loading = false,
  error = null,
}: ManageBookingLookupFormProps) {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reference.trim(), email.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 rounded-lg border border-gray-200 bg-white"
    >
      <p className="text-sm text-gray-600">
        Enter your confirmation reference and email to view or cancel your
        booking.
      </p>
      <div>
        <label
          htmlFor="manage-ref"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reference
        </label>
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
        <label
          htmlFor="manage-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
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
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={loading}>
        View booking
      </Button>
    </form>
  );
}
