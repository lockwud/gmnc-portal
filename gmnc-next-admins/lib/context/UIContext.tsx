"use client";

import React, { createContext, useContext, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface UIContextType {
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <UIContext.Provider value={{ 
      isSearchOpen, setSearchOpen, 
      isNotificationsOpen, setNotificationsOpen,
      isProfileOpen, setProfileOpen,
      toasts, addToast, removeToast 
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
