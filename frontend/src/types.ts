export interface Branch {
  id: number;
  name: string;
  address: string;
  branchCode: string;
  openTime: string;
  closeTime: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface ConfirmationPayload {
  confirmationReference: string;
  branch: string;
  branchAddress: string;
  branchCode?: string;
  /** UTC ISO; UI formats in local timezone */
  bookingTime: string;
  durationMinutes: number;
  customerName: string;
  customerEmail?: string;
  status?: string;
}

/** Single booking as returned from list or get endpoint */
export interface BookingListItem extends ConfirmationPayload {
  branchId?: number;
  customerPhone?: string;
}

export interface AppointmentCreateBody {
  branchId: number;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface MonthAvailability {
  datesWithSlots: string[];
}

export interface AppointmentUpdateBody {
  email: string;
  date?: string;
  startTime?: string;
  branchId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
}
