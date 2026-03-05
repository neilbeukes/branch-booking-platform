import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Form } from "../../../components/Form";
import { appointments } from "../../../api/client";
import type { Branch, Slot, ConfirmationPayload } from "../../../types";

const detailsSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  customerEmail: z.string().email("Please enter a valid email"),
});

const detailsFields = [
  { name: "customerName", label: "Full name", placeholder: "John Doe" },
  { name: "customerPhone", label: "Phone", placeholder: "081 123 4567" },
  { name: "customerEmail", label: "Email", placeholder: "john@example.com" },
];

interface DetailsStepProps {
  branch: Branch;
  date: string;
  slot: Slot;
  onSubmit: (data: ConfirmationPayload) => void;
  /** When set, form submits via PATCH and uses these as default values */
  editReference?: string;
  editEmail?: string;
  defaultValues?: Record<string, string>;
}

export function DetailsStep({
  branch,
  date,
  slot,
  onSubmit,
  editReference,
  editEmail,
  defaultValues,
}: DetailsStepProps) {
  console.log("🚀 ~ DetailsStep ~ date:", date);
  const createMutation = useMutation({
    mutationFn: appointments.create,
    onSuccess: (data) => onSubmit(data),
  });
  const updateMutation = useMutation({
    mutationFn: ({
      ref,
      body,
    }: {
      ref: string;
      body: Parameters<typeof appointments.update>[1];
    }) => appointments.update(ref, body),
    onSuccess: (data) => onSubmit(data),
  });

  const isEdit = Boolean(editReference && editEmail);
  const mutation = isEdit ? updateMutation : createMutation;

  const handleSubmit = (data: Record<string, string>) => {
    if (isEdit) {
      updateMutation.mutate({
        ref: editReference!,
        body: {
          email: editEmail!,
          branchId: branch.id,
          date,
          startTime: slot.startTime,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
        },
      });
    } else {
      createMutation.mutate({
        branchId: branch.id,
        date,
        startTime: slot.startTime,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
      });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {branch.name} · {date} · {slot.startTime}
      </p>
      <Form
        schema={detailsSchema}
        fields={detailsFields}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        submitLabel={
          mutation.isPending
            ? isEdit
              ? "Updating…"
              : "Booking..."
            : isEdit
              ? "Update booking"
              : "Confirm booking"
        }
        submitDisabled={mutation.isPending}
      />
      {mutation.isError && (
        <p className="text-red-600 text-sm" role="alert">
          {mutation.error?.message}
        </p>
      )}
    </div>
  );
}
