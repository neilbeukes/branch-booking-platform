import { createContext, useCallback, useContext, useState } from "react";
import { ConfirmationModalContextValue, ConfirmOptions } from "./types";
import ConfirmationModal from "../../components/ConfirmationModal";

const ConfirmationModalContext = createContext<
  ConfirmationModalContextValue | undefined
>(undefined);

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function ConfirmationModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve });
    });
  }, []);

  const handleClose = useCallback(
    (confirmed: boolean) => {
      if (pending) {
        pending.resolve(confirmed);
        setPending(null);
      }
    },
    [pending],
  );

  return (
    <ConfirmationModalContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <ConfirmationModal
          {...pending.options}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </ConfirmationModalContext.Provider>
  );
}

export function useConfirmationModal() {
  const ctx = useContext(ConfirmationModalContext);
  if (ctx == null) {
    throw new Error(
      "useConfirmationModal must be used within ConfirmationModalProvider",
    );
  }
  return ctx;
}
