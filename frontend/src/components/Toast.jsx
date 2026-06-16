import React, { useEffect, useState } from 'react';

const toastStyle = `
  @keyframes slideUp {
    from { transform: translateY(100px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes slideDown {
    from { transform: translateY(0);    opacity: 1; }
    to   { transform: translateY(100px); opacity: 0; }
  }
`;
if (!document.getElementById('toast-style')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'toast-style';
  styleTag.innerHTML = toastStyle;
  document.head.appendChild(styleTag);
}

const TOAST_CONFIG = {
  success: {
    background: 'var(--color-status-done)',
    icon: '✓',
  },
  error: {
    background: 'var(--color-reconnecting)',
    icon: '✕',
  },
  conflict: {
    background: 'var(--color-accent-orange)',
    icon: '⚡',
  },
  info: {
    background: 'var(--color-primary-blue)',
    icon: 'ℹ',
  },
};

const Toast = ({ toast }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast]);

  if (!toast) return null;

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  const containerStyles = {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    borderRadius: 'var(--radius-pill)',
    background: config.background,
    color: '#fff',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-body)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    animation: visible
      ? 'slideUp 0.3s ease-out forwards'
      : 'slideDown 0.3s ease-in forwards',
    whiteSpace: 'nowrap',
  };

  const iconStyles = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'var(--font-weight-bold)',
    flexShrink: 0,
  };

  return (
    <div style={containerStyles}>
      <span style={iconStyles}>{config.icon}</span>
      {toast.message}
    </div>
  );
};

export default Toast;