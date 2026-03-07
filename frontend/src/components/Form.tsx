import { useState, FormEvent } from "react";
import { z } from "zod";
import { Button } from "./Button";

/**
 * Reusable form: pass a Zod schema and a list of fields (name, label, placeholder).
 * On submit, values are validated with the schema; if valid, onSubmit is called with the parsed data.
 * All fields are rendered as text inputs; Zod handles validation and error messages.
 */

export interface FieldConfig {
  name: string;
  label: string;
  placeholder?: string;
}

interface FormProps {
  schema: z.ZodType<Record<string, string>>;
  fields: FieldConfig[];
  onSubmit: (data: Record<string, string>) => void;
  defaultValues?: Record<string, string>;
  submitLabel?: string;
  submitDisabled?: boolean;
  className?: string;
}

export function Form({
  schema,
  fields,
  onSubmit,
  defaultValues = {},
  submitLabel = "Submit",
  submitDisabled = false,
  className = "",
}: FormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.name] = defaultValues[f.name] ?? "";
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      onSubmit(result.data);
    } else {
      const fieldErrors: Record<string, string> = {};
      const zodErrors = z.flattenError(result.error).fieldErrors;
      for (const [key, messages] of Object.entries(zodErrors)) {
        if (Array.isArray(messages) && messages[0])
          fieldErrors[key] = messages[0];
      }
      setErrors(fieldErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            type="text"
            value={values[field.name] ?? ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 invalid:border-red-500"
            aria-invalid={!!errors[field.name]}
            aria-describedby={
              errors[field.name] ? `${field.name}-error` : undefined
            }
          />
          {errors[field.name] && (
            <p
              id={`${field.name}-error`}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}
      <Button type="submit" variant="primary" disabled={submitDisabled}>
        {submitLabel}
      </Button>
    </form>
  );
}
