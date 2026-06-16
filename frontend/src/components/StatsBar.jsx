import React from 'react';

const StatCard = ({ icon, label, value, accent }) => {
  const cardStyles = {
    flex: 1,
    background: 'var(--color-bg-white)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 20px',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: '140px',
  };

  const iconCircleStyles = {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: accent + '20',   
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  };

  const textStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const valueStyles = {
    fontSize: 'var(--font-size-h2)',
    fontWeight: 'var(--font-weight-bold)',
    color: accent,
    lineHeight: 1.1,
  };

  const labelStyles = {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={cardStyles}>
      <div style={iconCircleStyles}>{icon}</div>
      <div style={textStyles}>
        <span style={valueStyles}>{value}</span>
        <span style={labelStyles}>{label}</span>
      </div>
    </div>
  );
};

const StatsBar = ({ stats }) => {
  if (!stats) return null;

  const { totalWaiting, currentlyInProgress, avgConsultMinutes, estimatedNextWaitMinutes } = stats;

  const barStyles = {
    display: 'flex',
    gap: 'var(--space-grid-gap)',
    marginBottom: 'var(--space-lg)',
    flexWrap: 'wrap',
  };

  return (
    <div style={barStyles}>
      <StatCard
        icon="🟡"
        label="Waiting"
        value={totalWaiting}
        accent="var(--color-accent-yellow)"
      />
      <StatCard
        icon="🟠"
        label="In Progress"
        value={currentlyInProgress}
        accent="var(--color-accent-orange)"
      />
      <StatCard
        icon="⏱"
        label="Avg Consult"
        value={`${avgConsultMinutes} min`}
        accent="var(--color-primary-blue)"
      />
      <StatCard
        icon="🔮"
        label="Next Wait"
        value={`~${estimatedNextWaitMinutes} min`}
        accent="var(--color-primary-blue-dark)"
      />
    </div>
  );
};

export default StatsBar;