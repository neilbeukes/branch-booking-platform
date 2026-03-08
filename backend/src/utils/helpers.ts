import { addMinutes } from "date-fns";
import type { PrismaClient } from "@prisma/client";

export async function hasOverlappingAppointment(
  prisma: PrismaClient,
  branchId: number,
  start: Date,
  durationMinutes: number,
  excludeReference?: string,
): Promise<boolean> {
  const scheduled = await prisma.appointment.findMany({
    where: {
      branchId,
      status: "scheduled",
      ...(excludeReference
        ? { NOT: { confirmationReference: excludeReference } }
        : {}),
    },
    select: { bookingTime: true, durationMinutes: true },
  });
  return scheduled.some((a) =>
    windowsOverlap(start, durationMinutes, a.bookingTime, a.durationMinutes),
  );
}

export function windowsOverlap(
  startA: Date,
  durationMinutesA: number,
  startB: Date,
  durationMinutesB: number,
): boolean {
  const endA = addMinutes(startA, durationMinutesA);
  const endB = addMinutes(startB, durationMinutesB);
  return startA < endB && startB < endA;
}

export function genReference(): string {
  return "CAP-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function isPrismaConflictError(e: unknown): e is { code: string } {
  return typeof e === "object" && e !== null && "code" in e;
}

export function isValidString(s: string | undefined): s is string {
  return s != null && typeof s === "string" && s.trim() !== "";
}
