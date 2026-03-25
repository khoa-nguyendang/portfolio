import { useState, useCallback, useRef } from 'react';
import type { ToastItem } from '@/components/Toast';

const TOAST_DURATION = 4000;
const EXIT_ANIMATION_DURATION = 300;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    // Start exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_DURATION);

    // Clean up timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (type: ToastItem['type'], message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setToasts((prev) => [...prev, { id, type, message }]);

      const timer = setTimeout(() => {
        dismiss(id);
      }, TOAST_DURATION);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  return {
    toasts,
    showToast,
    dismiss,
  };
}
