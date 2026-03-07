export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export interface ConfirmationModalContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}