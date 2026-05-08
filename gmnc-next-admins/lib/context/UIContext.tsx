"use client";

import * as React from "react";
import { ToastProvider, useToast } from "@/components/ui/Toast";

type UIToastVariant = "emerald" | "blue" | "rose";

type UIContextValue = {
  addToast: (message: string, variant?: UIToastVariant) => void;
  isSearchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const UIContext = React.createContext<UIContextValue | undefined>(undefined);

function UIProviderContent({ children }: { children: React.ReactNode }) {
  const { show, hide } = useToast();
  const [isSearchOpen, setSearchOpen] = React.useState(false);

  const addToast = React.useCallback(
    (message: string, variant: UIToastVariant = "blue") => {
      const titleByVariant: Record<UIToastVariant, string> = {
        emerald: "Success",
        blue: "Notice",
        rose: "Error",
      };

      show({
        title: titleByVariant[variant],
        message,
        duration: 4000,
        proceedLabel: "Close",
        dismissLabel: "Dismiss",
        onProceed: hide,
        onDismiss: hide,
      });
    },
    [hide, show],
  );

  const value = React.useMemo(
    () => ({
      addToast,
      isSearchOpen,
      setSearchOpen,
    }),
    [addToast, isSearchOpen],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <UIProviderContent>{children}</UIProviderContent>
    </ToastProvider>
  );
}

export function useUI() {
  const context = React.useContext(UIContext);

  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }

  return context;
}
