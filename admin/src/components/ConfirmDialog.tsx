import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open, onCancel]);

  if (!open) return null;

  const confirmColors =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl fade-in">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-500/10 p-2.5">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${confirmColors}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
