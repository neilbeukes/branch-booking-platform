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
  date: string;
  time: string;
  customerName: string;
  customerEmail?: string;
  status?: string;
}

/** Single booking as returned from list or get endpoint */
export interface BookingListItem extends ConfirmationPayload {
  branchId?: number;
  endTime?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface AppointmentCreateBody {
  branchId: number;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
}