import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { SLOT_MINUTES, BOOKING_TIMEZONE } from "../utils/consts.js";
import {
  utcToLocalTime,
  localDateToUTCRange,
  todayInTimezone,
} from "../utils/date.js";

export const branchesRouter = Router();

// GET /api/branches — list all branches.
branchesRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const branches = await prisma.branch.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          address: true,
          branchCode: true,
          openTime: true,
          closeTime: true,
        },
      });
      res.json(branches);
    } catch (e) {
      next(e);
    }
  },
);

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function getSlotsForDay(
  openTime: string,
  closeTime: string,
  bookedStartTimes: string[],
): { startTime: string; endTime: string }[] {
  const startMinutes = timeToMinutes(openTime);
  const endMinutes = timeToMinutes(closeTime);
  const bookedSet = new Set(bookedStartTimes);
  const slots: { startTime: string; endTime: string }[] = [];
  for (
    let m = startMinutes;
    m + SLOT_MINUTES <= endMinutes;
    m += SLOT_MINUTES
  ) {
    const startTime = minutesToTime(m);
    if (!bookedSet.has(startTime)) {
      slots.push({ startTime, endTime: minutesToTime(m + SLOT_MINUTES) });
    }
  }
  return slots;
}

// From appointments (bookingTime UTC + durationMinutes), return set of local slot start times (HH:mm) in the given timezone.
function getBookedSlotStarts(
  appointments: { bookingTime: Date; durationMinutes: number }[],
  timezone: string,
): Set<string> {
  const taken = new Set<string>();
  for (const a of appointments) {
    const startLocal = utcToLocalTime(a.bookingTime, timezone);
    const [h, min] = startLocal.split(":").map(Number);
    const startMinutes = (h ?? 0) * 60 + (min ?? 0);
    const endMinutes = startMinutes + a.durationMinutes;
    for (let m = startMinutes; m < endMinutes; m += SLOT_MINUTES) {
      taken.add(minutesToTime(m));
    }
  }
  return taken;
}

// GET /api/branches/:id/availability/month?month=YYYY-MM — dates in that month that have at least one free slot.
branchesRouter.get(
  "/:id/availability/month",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const monthParam = req.query.month as string | undefined; // YYYY-MM
      if (!monthParam || isNaN(id)) {
        return res
          .status(400)
          .json({ error: "Invalid branch id or month (use month=YYYY-MM)" });
      }
      const [y, m] = monthParam.split("-").map(Number);
      if (!y || m == null || m < 1 || m > 12) {
        return res.status(400).json({ error: "Invalid month; use YYYY-MM" });
      }
      const branch = await prisma.branch.findUnique({ where: { id } });
      if (!branch) return res.status(404).json({ error: "Branch not found" });

      const todayStr = todayInTimezone(BOOKING_TIMEZONE);
      const daysInMonth = new Date(y, m, 0).getDate();
      const datesWithSlots: string[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (dateStr < todayStr) continue;

        const { start: rangeStart, end: rangeEnd } = localDateToUTCRange(
          dateStr,
          BOOKING_TIMEZONE,
        );
        const appointments = await prisma.appointment.findMany({
          where: {
            branchId: id,
            status: "scheduled",
            bookingTime: { gte: rangeStart, lt: rangeEnd },
          },
          select: { bookingTime: true, durationMinutes: true },
        });
        const bookedStarts = getBookedSlotStarts(
          appointments,
          BOOKING_TIMEZONE,
        );
        const slots = getSlotsForDay(branch.openTime, branch.closeTime, [
          ...bookedStarts,
        ]);
        if (slots.length > 0) datesWithSlots.push(dateStr);
      }

      res.json({ datesWithSlots });
    } catch (e) {
      next(e);
    }
  },
);

// GET /api/branches/:id/availability?date=YYYY-MM-DD — free time slots for that day.
branchesRouter.get(
  "/:id/availability",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const dateStr = req.query.date as string | undefined;
      if (!dateStr || isNaN(id)) {
        return res.status(400).json({ error: "Invalid branch id or date" });
      }
      const branch = await prisma.branch.findUnique({ where: { id } });
      if (!branch) return res.status(404).json({ error: "Branch not found" });

      const { start: rangeStart, end: rangeEnd } = localDateToUTCRange(
        dateStr,
        BOOKING_TIMEZONE,
      );
      const appointments = await prisma.appointment.findMany({
        where: {
          branchId: id,
          status: "scheduled",
          bookingTime: { gte: rangeStart, lt: rangeEnd },
        },
        select: { bookingTime: true, durationMinutes: true },
      });
      const bookedStarts = getBookedSlotStarts(appointments, BOOKING_TIMEZONE);
      const slots = getSlotsForDay(branch.openTime, branch.closeTime, [
        ...bookedStarts,
      ]);
      res.json(slots);
    } catch (e) {
      next(e);
    }
  },
);
