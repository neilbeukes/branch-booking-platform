import { Router, Request, Response, NextFunction } from 'express';
import { addMinutes } from 'date-fns';
import { prisma } from '../lib/prisma.js';
import { localDateAndTimeToUTC } from '../utils/date.js';
import { SLOT_MINUTES, BOOKING_TIMEZONE } from '../utils/consts.js';

export const appointmentsRouter = Router();

const branchSelect = { name: true, address: true, branchCode: true } as const;

type AppointmentRow = {
  bookingTime: Date;
  durationMinutes: number;
  confirmationReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  branchId: number;
  branch: { name: string; address: string; branchCode: string };
};

function toAppointmentDto(a: AppointmentRow) {
  return {
    confirmationReference: a.confirmationReference,
    branchId: a.branchId,
    branch: a.branch.name,
    branchAddress: a.branch.address,
    branchCode: a.branch.branchCode,
    bookingTime: a.bookingTime.toISOString(),
    durationMinutes: a.durationMinutes,
    customerName: a.customerName,
    customerPhone: a.customerPhone,
    customerEmail: a.customerEmail,
    status: a.status,
  };
}

function windowsOverlap(
  startA: Date,
  durationMinutesA: number,
  startB: Date,
  durationMinutesB: number
): boolean {
  const endA = addMinutes(startA, durationMinutesA);
  const endB = addMinutes(startB, durationMinutesB);
  return startA < endB && startB < endA;
}

/** GET /api/appointments — list all appointments */
appointmentsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { bookingTime: 'asc' },
      include: { branch: { select: branchSelect } },
    });
    res.json(appointments.map(toAppointmentDto));
  } catch (e) {
    next(e);
  }
});

function genReference(): string {
  return 'CAP-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function isPrismaConflictError(e: unknown): e is { code: string } {
  return typeof e === 'object' && e !== null && 'code' in e;
}

/** POST /api/appointments — body: branchId, date (YYYY-MM-DD), startTime (HH:mm), customerName, customerPhone, customerEmail */
appointmentsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, date, startTime, customerName, customerPhone, customerEmail } = req.body;
    if (!branchId || !date || !startTime || !customerName || !customerPhone || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const branch = await prisma.branch.findUnique({ where: { id: Number(branchId) } });
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    const bookingTime = localDateAndTimeToUTC(date as string, startTime as string, BOOKING_TIMEZONE);
    const confirmationReference = genReference();

    // Prevent double-booking: no overlapping windows for same branch.
    const scheduled = await prisma.appointment.findMany({
      where: { branchId: branch.id, status: 'scheduled' },
      select: { bookingTime: true, durationMinutes: true },
    });
    const hasOverlap = scheduled.some((a) =>
      windowsOverlap(bookingTime, SLOT_MINUTES, a.bookingTime, a.durationMinutes)
    );
    if (hasOverlap) {
      return res.status(409).json({ error: 'Slot no longer available' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        branchId: branch.id,
        bookingTime,
        durationMinutes: SLOT_MINUTES,
        customerName: customerName as string,
        customerPhone: customerPhone as string,
        customerEmail: customerEmail as string,
        confirmationReference,
      },
      include: { branch: { select: branchSelect } },
    });

    res.status(201).json(toAppointmentDto(appointment));
  } catch (e) {
    if (isPrismaConflictError(e) && e.code === 'P2002') {
      return res.status(409).json({ error: 'Slot no longer available' });
    }
    next(e);
  }
});

/** GET /api/appointments/:reference — get one. If ?email= provided, return only if customerEmail matches */
appointmentsRouter.get('/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { confirmationReference: req.params.reference },
      include: { branch: { select: branchSelect } },
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    const email = req.query.email as string | undefined;
    if (email != null && email.trim() !== '' && appointment.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(toAppointmentDto(appointment));
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/appointments/:reference — cancel (body: { email }). Email must match. */
appointmentsRouter.delete('/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body?.email as string | undefined;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const appointment = await prisma.appointment.findUnique({
      where: { confirmationReference: req.params.reference },
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match this booking' });
    }
    await prisma.appointment.update({
      where: { confirmationReference: req.params.reference },
      data: { status: 'cancelled' },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/appointments/:reference — update (body: { email, date?, startTime?, branchId?, customerName?, customerPhone? }). Email must match. */
appointmentsRouter.patch('/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, date, startTime, branchId, customerName, customerPhone } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const appointment = await prisma.appointment.findUnique({
      where: { confirmationReference: req.params.reference },
      include: { branch: { select: branchSelect } },
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match this booking' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot update a cancelled booking' });
    }

    const updates: {
      bookingTime?: Date;
      durationMinutes?: number;
      branchId?: number;
      customerName?: string;
      customerPhone?: string;
    } = {};
    if (branchId != null) updates.branchId = Number(branchId);
    if (customerName != null) updates.customerName = String(customerName);
    if (customerPhone != null) updates.customerPhone = String(customerPhone);
    if (date != null && startTime != null) {
      updates.bookingTime = localDateAndTimeToUTC(String(date), String(startTime), BOOKING_TIMEZONE);
      updates.durationMinutes = SLOT_MINUTES;
    }

    if (Object.keys(updates).length === 0) {
      return res.json(toAppointmentDto(appointment));
    }

    const finalBranchId = updates.branchId ?? appointment.branchId;
    const finalBookingTime = updates.bookingTime ?? appointment.bookingTime;
    const finalDuration = updates.durationMinutes ?? appointment.durationMinutes;

    if (updates.bookingTime != null) {
      // Prevent double-booking: no overlapping windows for same branch.
      const scheduled = await prisma.appointment.findMany({
        where: {
          branchId: finalBranchId,
          status: 'scheduled',
          NOT: { confirmationReference: req.params.reference },
        },
        select: { bookingTime: true, durationMinutes: true },
      });
      const hasOverlap = scheduled.some((a) =>
        windowsOverlap(finalBookingTime, finalDuration, a.bookingTime, a.durationMinutes)
      );
      if (hasOverlap) {
        return res.status(409).json({ error: 'Slot no longer available' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { confirmationReference: req.params.reference },
      data: updates,
      include: { branch: { select: branchSelect } },
    });
    res.json(toAppointmentDto(updated));
  } catch (e) {
    if (isPrismaConflictError(e) && e.code === 'P2002') return res.status(409).json({ error: 'Slot no longer available' });
    next(e);
  }
});
