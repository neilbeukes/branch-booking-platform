import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "../../../components/Button";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getCalendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const pad = Array.from({ length: startPad }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  return [...pad, ...days];
}

function toDateStr(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

function isPast(dateStr: string): boolean {
  return dateStr < todayStr();
}

export interface BookingCalendarProps {
  viewYear: number;
  viewMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDate: string | null;
  onDateSelect: (dateStr: string) => void;
  datesWithSlots: Set<string>;
}

export function BookingCalendar({
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onDateSelect,
  datesWithSlots,
}: BookingCalendarProps) {
  const calendarDays = getCalendarDays(viewYear, viewMonth);
  const today = todayStr();

  const handleDateClick = (day: number) => {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    if (isPast(dateStr) || !datesWithSlots.has(dateStr)) return;
    onDateSelect(dateStr);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm w-full max-w-[280px]">
      <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100 bg-gray-50/80">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="min-w-8 min-h-8"
        >
          <FiChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-sm font-semibold text-gray-900">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
          className="min-w-8 min-h-8"
        >
          <FiChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium text-gray-500 py-0.5"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`e-${i}`} className="aspect-square min-w-0" />;
            }
            const dateStr = toDateStr(viewYear, viewMonth, day);
            const isPastDay = isPast(dateStr);
            const hasSlots = datesWithSlots.has(dateStr);
            const noSlots = !isPastDay && !hasSlots;
            const disabled = isPastDay || noSlots;
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === today;
            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square min-w-0 rounded-md text-xs font-medium transition
                  ${disabled ? "cursor-not-allowed" : ""}
                  ${isPastDay ? "text-gray-300" : ""}
                  ${noSlots ? "text-gray-400 opacity-60 blur-[0.5px]" : ""}
                  ${!disabled && !isSelected ? "text-gray-700 hover:bg-gray-100" : ""}
                  ${isSelected ? "bg-gray-900 text-white opacity-100 blur-none" : ""}
                  ${!disabled && isToday && !isSelected ? "ring-1 ring-gray-400" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
