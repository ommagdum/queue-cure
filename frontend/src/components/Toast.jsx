
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Zap, Info } from 'lucide-react';
const TOAST_CONFIG = {
  success:  { className: 'bg-emerald-600', Icon: CheckCircle },
  error:    { className: 'bg-red-600',     Icon: AlertCircle },
  conflict: { className: 'bg-amber-500',   Icon: Zap },
  info:     { className: 'bg-slate-700',   Icon: Info },
};
const Toast = ({ toast }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(!!toast);
  }, [toast]);
  if (!toast) return null;
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const { Icon } = config;
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg text-white text-sm font-semibold shadow-lg transition-all ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } ${config.className}`}>
      <Icon size={16} />
      {toast.message}
    </div>
  );
};
export default Toast;