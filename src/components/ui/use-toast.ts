
"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type State = {
  toasts: ToasterToast[];
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function emit() {
  listeners.forEach((l) => l(memoryState));
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function addToast(toast: Omit<ToasterToast, "id">) {
  const id = genId();
  const next = [{ ...toast, id }, ...memoryState.toasts].slice(0, TOAST_LIMIT);
  memoryState = { toasts: next };
  emit();

  window.setTimeout(() => {
    dismissToast(id);
  }, TOAST_REMOVE_DELAY);

  return id;
}

function dismissToast(id: string) {
  memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== id) };
  emit();
}

export function toast(toastData: Omit<ToasterToast, "id">) {
  const id = addToast(toastData);
  return {
    id,
    dismiss: () => dismissToast(id),
  };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: dismissToast,
  };
}
