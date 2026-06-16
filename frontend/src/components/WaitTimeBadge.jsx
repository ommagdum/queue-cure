import React from 'react';

const WaitTimeBadge = ({ minutes, status }) => {
  if (status !== 'WAITING' || minutes === null || minutes === undefined) {
    return null;
  }

  const containerStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-semibold)',
    backgroundColor: 'var(--color-accent-yellow-light)',
    color: '#8B6200',   
    whiteSpace: 'nowrap',
  };

  return (
    <span style={containerStyles}>
      ⏱ ~{minutes} min
    </span>
  );
};

export default WaitTimeBadge;