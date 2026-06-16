// components/ConnectionIndicator.jsx
import React from 'react';

const ConnectionIndicator = ({ status }) => {
  const isLive = status === 'LIVE';
  const isReconnecting = status === 'RECONNECTING';

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
      isLive
        ? 'bg-white border-gray-200 text-slate-700'
        : 'bg-white border-red-200 text-red-700'
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        isLive ? 'bg-emerald-500 animate-pulse' : isReconnecting ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
      }`} />
      {isLive ? 'Live' : isReconnecting ? 'Reconnecting...' : 'Connecting...'}
    </span>
  );
};

export default ConnectionIndicator;