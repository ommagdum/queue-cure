import React from 'react';

const pulseStyle = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.85); }
  }
`;
if (!document.getElementById('pulse-style')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'pulse-style';
  styleTag.innerHTML = pulseStyle;
  document.head.appendChild(styleTag);
}

const ConnectionIndicator = ({ status }) => {
  const isLive         = status === 'LIVE';
  const isReconnecting = status === 'RECONNECTING';

  const containerStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: 'var(--radius-pill)',
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-semibold)',
    backgroundColor: isLive
      ? 'rgba(52, 199, 89, 0.15)'
      : 'rgba(255, 59, 48, 0.15)',
    color: isLive
      ? 'var(--color-live)'
      : 'var(--color-reconnecting)',
    border: `1.5px solid ${isLive ? 'var(--color-live)' : 'var(--color-reconnecting)'}`,
    transition: 'var(--transition-base)',
  };

  const dotStyles = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isLive
      ? 'var(--color-live)'
      : 'var(--color-reconnecting)',
    flexShrink: 0,
    animation: isReconnecting ? 'pulse 1.2s ease-in-out infinite' : 'none',
  };

  const label = isLive
    ? '🟢 Live'
    : isReconnecting
    ? '🔴 Reconnecting…'
    : '⚪ Connecting…';

  return (
    <span style={containerStyles}>
      <span style={dotStyles} />
      {label}
    </span>
  );
};

export default ConnectionIndicator;