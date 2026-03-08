import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { localDateAndTimeToUTC } from "../utils/date.js";
import { SLOT_MINUTES, BOOKING_TIMEZONE } from "../utils/consts.js";
import {
  genReference,
  hasOverlappingAppointment,
  isPrismaConflictError,
  isValidString,
} from "../utils/helpers.js";

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

// GET /api/appointments - list all appointments
appointmentsRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const appointments = await prisma.appointment.findMany({
        orderBy: { bookingTime: "asc" },
        include: { branch: { select: branchSelect } },
      });
      res.json(appointments.map(toAppointmentDto));
    } catch (e) {
      next(e);
    }
  },
);

// POST /api/appointments — body: branchId, date (YYYY-MM-DD), startTime (HH:mm), customerName, customerPhone, customerEmail
appointmentsRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        branchId,
        date,
        startTime,
        customerName,
        customerPhone,
        customerEmail,
      } = req.body;
      if (
        !branchId ||
        !date ||
        !startTime ||
        !customerName ||
        !customerPhone ||
        !customerEmail
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const branch = await prisma.branch.findUnique({
        where: { id: Number(branchId) },
      });
      if (!branch) return res.status(404).json({ error: "Branch not found" });

      const bookingTime = localDateAndTimeToUTC(
        date as string,
        startTime as string,
        BOOKING_TIMEZONE,
      );
      const confirmationReference = genReference();

      if (
        await hasOverlappingAppointment(
          prisma,
          branch.id,
          bookingTime,
          SLOT_MINUTES,
        )
      ) {
        return res.status(409).json({ error: "Slot no longer available" });
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
      if (isPrismaConflictError(e) && e.code === "P2002") {
        return res.status(409).json({ error: "Slot no longer available" });
      }
      next(e);
    }
  },
);

// GET /api/appointments/:reference — get one. ?email= is required and must match customerEmail.
appointmentsRouter.get(
  "/:reference",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.query.email as string | undefined;
      if (!isValidString(email)) {
        return res
          .status(400)
          .json({ error: "Email is required to view an appointment" });
      }
      const appointment = await prisma.appointment.findUnique({
        where: { confirmationReference: req.params.reference },
        include: { branch: { select: branchSelect } },
      });
      if (
        !appointment ||
        appointment.customerEmail.toLowerCase() !== email.toLowerCase()
      ) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(toAppointmentDto(appointment));
    } catch (e) {
      next(e);
    }
  },
);

// DELETE /api/appointments/:reference — cancel (body: { email }). Email must match.
appointmentsRouter.delete(
  "/:reference",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body?.email as string | undefined;
      if (!isValidString(email)) {
        return res.status(400).json({ error: "Email is required" });
      }
      const appointment = await prisma.appointment.findUnique({
        where: { confirmationReference: req.params.reference },
      });
      if (!appointment)
        return res.status(404).json({ error: "Appointment not found" });
      if (
        appointment.customerEmail.toLowerCase() !== email.trim().toLowerCase()
      ) {
        return res
          .status(403)
          .json({ error: "Email does not match this booking" });
      }
      await prisma.appointment.update({
        where: { confirmationReference: req.params.reference },
        data: { status: "cancelled" },
      });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
);

// PATCH /api/appointments/:reference — update (body: { email, date?, startTime?, branchId?, customerName?, customerPhone? }). Email must match.
appointmentsRouter.patch(
  "/:reference",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, date, startTime, branchId, customerName, customerPhone } =
        req.body;
      if (!isValidString(email)) {
        return res.status(400).json({ error: "Email is required" });
      }
      const appointment = await prisma.appointment.findUnique({
        where: { confirmationReference: req.params.reference },
        include: { branch: { select: branchSelect } },
      });
      if (!appointment)
        return res.status(404).json({ error: "Appointment not found" });
      if (
        appointment.customerEmail.toLowerCase() !== email.trim().toLowerCase()
      ) {
        return res
          .status(403)
          .json({ error: "Email does not match this booking" });
      }
      if (appointment.status === "cancelled") {
        return res
          .status(400)
          .json({ error: "Cannot update a cancelled booking" });
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
        updates.bookingTime = localDateAndTimeToUTC(
          String(date),
          String(startTime),
          BOOKING_TIMEZONE,
        );
        updates.durationMinutes = SLOT_MINUTES;
      }

      if (Object.keys(updates).length === 0) {
        return res.json(toAppointmentDto(appointment));
      }

      if (updates.bookingTime != null) {
        const branchId = updates.branchId ?? appointment.branchId;
        const start = updates.bookingTime ?? appointment.bookingTime;
        const duration = updates.durationMinutes ?? appointment.durationMinutes;
        if (
          await hasOverlappingAppointment(
            prisma,
            branchId,
            start,
            duration,
            req.params.reference,
          )
        ) {
          return res.status(409).json({ error: "Slot no longer available" });
        }
      }

      const updated = await prisma.appointment.update({
        where: { confirmationReference: req.params.reference },
        data: updates,
        include: { branch: { select: branchSelect } },
      });
      res.json(toAppointmentDto(updated));
    } catch (e) {
      if (isPrismaConflictError(e) && e.code === "P2002")
        return res.status(409).json({ error: "Slot no longer available" });
      next(e);
    }
  },
);
