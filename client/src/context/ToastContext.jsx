import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className="fixed top-6 right-6 z-50 animate-rise"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-[14px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] backdrop-blur-xl border ${
            toast.type === 'success'
              ? 'bg-white/90 border-emerald-200'
              : 'bg-white/90 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="text-emerald-500" size={20} />
            ) : (
              <XCircle className="text-red-500" size={20} />
            )}
            <span className="text-sm font-medium text-brand-900">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}