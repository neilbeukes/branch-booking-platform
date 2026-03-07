import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { branches } from "../../../api/client";
import type { Branch, Slot } from "../../../types";
import { BookingCalendar } from "./BookingCalendar";
import { SlotPicker } from "./SlotPicker";

interface DateTimeStepProps {
  branch: Branch;
  onSelect: (date: string, slot: Slot) => void;
}

export function DateTimeStep({ branch, onSelect }: DateTimeStepProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const { data: monthAvailability } = useQuery({
    queryKey: ["availabilityMonth", branch.id, monthKey],
    queryFn: () => branches.availabilityMonth(branch.id, monthKey),
    enabled: !!branch.id,
  });
  const datesWithSlots = new Set(monthAvailability?.datesWithSlots ?? []);

  const dateStr = selectedDate ?? "";
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["availability", branch.id, dateStr],
    queryFn: () => branches.availability(branch.id, dateStr),
    enabled: !!dateStr,
  });

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) onSelect(selectedDate, selectedSlot);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">{branch.name}</p>

      <BookingCalendar
        viewYear={viewYear}
        viewMonth={viewMonth}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        datesWithSlots={datesWithSlots}
      />

      {selectedDate && (
        <SlotPicker
          selectedDate={selectedDate}
          slots={slots}
          isLoading={isLoading}
          selectedSlot={selectedSlot}
          onSlotSelect={setSelectedSlot}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
