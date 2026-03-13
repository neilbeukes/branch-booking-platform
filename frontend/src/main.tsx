import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { ConfirmationModalProvider } from "./contexts/ConfirmationModalContext/ConfirmationModalContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfirmationModalProvider>
          <App />
          <Toaster />
        </ConfirmationModalProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
