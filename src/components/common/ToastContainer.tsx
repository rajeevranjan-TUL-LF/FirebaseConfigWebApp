import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useConfig();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 transition-all text-neutral-900 dark:text-neutral-100"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              {isError && <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
