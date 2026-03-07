-- Drop the full unique constraint on (branch_id, booking_time) so that
-- cancelled bookings don't block rebooking the same slot.
DROP INDEX IF EXISTS "appointments_branch_id_booking_time_key";

-- Enforce uniqueness only for non-cancelled appointments (allow rebook after cancel).
CREATE UNIQUE INDEX "appointments_branch_id_booking_time_scheduled_key"
ON "appointments" ("branch_id", "booking_time")
WHERE status != 'cancelled';
