import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  exiting?: boolean;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
};

const iconColorMap = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.exiting ? 'toast-exit' : 'toast-enter'
            } ${colorMap[toast.type]}`}
            style={{ minWidth: 320, maxWidth: 420 }}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${iconColorMap[toast.type]}`} />
            <p className="flex-1 text-sm text-gray-200">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 text-gray-500 transition-colors hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
