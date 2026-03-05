import type { Branch, Slot, ConfirmationPayload, AppointmentCreateBody, BookingListItem } from '../types';

const API_BASE = '/api';

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  const data = (text ? JSON.parse(text) : {}) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

export interface MonthAvailability {
  datesWithSlots: string[];
}

export const branches = {
  list: (): Promise<Branch[]> => api<Branch[]>('/branches'),
  availability: (id: number, date: string): Promise<Slot[]> =>
    api<Slot[]>(`/branches/${id}/availability?date=${date}`),
  availabilityMonth: (id: number, month: string): Promise<MonthAvailability> =>
    api<MonthAvailability>(`/branches/${id}/availability/month?month=${month}`),
};

export interface AppointmentUpdateBody {
  email: string;
  date?: string;
  startTime?: string;
  branchId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export const appointments = {
  list: (): Promise<BookingListItem[]> => api<BookingListItem[]>('/appointments'),
  create: (body: AppointmentCreateBody): Promise<ConfirmationPayload> =>
    api<ConfirmationPayload>('/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getByReference: (ref: string): Promise<BookingListItem> =>
    api<BookingListItem>(`/appointments/${ref}`),
  getByReferenceAndEmail: (ref: string, email: string): Promise<BookingListItem> =>
    api<BookingListItem>(`/appointments/${encodeURIComponent(ref)}?email=${encodeURIComponent(email)}`),
  cancel: async (ref: string, email: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/appointments/${encodeURIComponent(ref)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? res.statusText);
    }
  },
  update: (ref: string, body: AppointmentUpdateBody): Promise<BookingListItem> =>
    api<BookingListItem>(`/appointments/${encodeURIComponent(ref)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
