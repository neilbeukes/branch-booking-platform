import type { Slot } from "../../../types";
import { Button } from "../../../components/Button";

export interface SlotPickerProps {
  selectedDate: string;
  slots: Slot[];
  isLoading: boolean;
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
  onConfirm: () => void;
  confirmLabel?: string;
}

export function SlotPicker({
  selectedDate,
  slots,
  isLoading,
  selectedSlot,
  onSlotSelect,
  onConfirm,
  confirmLabel = "Next",
}: SlotPickerProps) {
  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString(
    "en-ZA",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    },
  );

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">
        Available times for {dateLabel}
      </h4>
      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading slots...</p>
      ) : slots.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No slots available for this date.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => {
            const active = selectedSlot?.startTime === slot.startTime;
            return (
              <Button
                key={slot.startTime}
                variant={active ? "primary" : "secondary"}
                size="sm"
                onClick={() => onSlotSelect(slot)}
              >
                {slot.startTime} – {slot.endTime}
              </Button>
            );
          })}
        </div>
      )}

      <Button
        variant="primary"
        onClick={onConfirm}
        disabled={!selectedSlot}
        className="w-full mt-4"
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
