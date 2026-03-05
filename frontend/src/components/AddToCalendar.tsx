import { useCallback } from 'react';
import { FaCalendarPlus } from 'react-icons/fa';
import { Button } from './Button';

export interface AddToCalendarEvent {
  /** Event title */
  title: string;
  /** Optional description */
  description?: string;
  /** Location (e.g. branch address) */
  location?: string;
  /** Start – full ISO string, or "YYYY-MM-DD" when startTime is provided */
  start: string;
  /** Start time "HH:mm" when start is date-only (e.g. "09:00" or "09:00 – 10:00" – first part used) */
  startTime?: string;
  /** End date/time – ISO string; if omitted, durationMinutes is used */
  end?: string;
  /** If end is not provided, duration in minutes from start (default 60) */
  durationMinutes?: number;
  /** URL to manage this booking (app /manage?reference=...&email=...); added to description and ICS URL */
  manageBookingUrl?: string;
}

function getStartDate(event: AddToCalendarEvent): Date {
  if (event.start.includes('T')) return new Date(event.start);
  const timeStr = event.startTime ?? '00:00';
  const timePart = timeStr.split('–')[0].trim();
  const [hours, minutes] = timePart.includes(':') ? timePart.split(':').map(Number) : [0, 0];
  const d = new Date(event.start);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function toICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function getEndDate(event: AddToCalendarEvent, startDate: Date): Date {
  if (event.end) return new Date(event.end);
  const duration = event.durationMinutes ?? 60;
  return new Date(startDate.getTime() + duration * 60 * 1000);
}

function buildDescriptionWithManageUrl(event: AddToCalendarEvent): string {
  const base = event.description ?? '';
  const manageLine = event.manageBookingUrl ? `\n\nManage booking: ${event.manageBookingUrl}` : '';
  return base + manageLine;
}

function buildICS(event: AddToCalendarEvent): string {
  const startDate = getStartDate(event);
  const endDate = getEndDate(event, startDate);
  const description = buildDescriptionWithManageUrl(event);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Capitec Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${toICSDate(startDate)}`,
    `DTEND:${toICSDate(endDate)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    ...(description ? [`DESCRIPTION:${escapeICS(description)}`] : []),
    ...(event.manageBookingUrl ? [`URL:${event.manageBookingUrl}`] : []),
    ...(event.location ? [`LOCATION:${escapeICS(event.location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

function escapeICS(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildGoogleCalendarUrl(event: AddToCalendarEvent): string {
  const startDate = getStartDate(event);
  const endDate = getEndDate(event, startDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
  });
  params.set('details', buildDescriptionWithManageUrl(event));
  if (event.location) params.set('location', event.location);
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookUrl(event: AddToCalendarEvent): string {
  const startDate = getStartDate(event);
  const endDate = getEndDate(event, startDate);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
  });
  params.set('body', buildDescriptionWithManageUrl(event));
  if (event.location) params.set('location', event.location);
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

interface AddToCalendarProps {
  event: AddToCalendarEvent;
  className?: string;
  /** Label for the main trigger (e.g. "Add to calendar") */
  label?: string;
}

export function AddToCalendar({ event, className = '', label = 'Add to calendar' }: AddToCalendarProps) {
  const handleDownloadICS = useCallback(() => {
    const ics = buildICS(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointment.ics';
    a.click();
    URL.revokeObjectURL(url);
  }, [event]);

  const googleUrl = buildGoogleCalendarUrl(event);
  const outlookUrl = buildOutlookUrl(event);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <FaCalendarPlus className="text-gray-500" aria-hidden />
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={handleDownloadICS}>
          Download .ics
        </Button>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition no-underline"
        >
          Google Calendar
        </a>
        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition no-underline"
        >
          Outlook
        </a>
      </div>
    </div>
  );
}
