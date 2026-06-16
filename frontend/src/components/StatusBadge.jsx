import React from 'react';
const STATUS_CONFIG = {
  WAITING: {
    label: 'Waiting',
    color: 'var(--color-status-waiting)',
    bg: 'var(--color-status-waiting-bg)',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'var(--color-accent-orange)',
    bg: 'var(--color-status-progress-bg)',
  },
  DONE: {
    label: 'Done',
    color: 'var(--color-status-done)',
    bg: 'var(--color-status-done-bg)',
  },
  NO_SHOW: {
    label: 'No Show',
    color: 'var(--color-status-noshow)',
    bg: 'var(--color-status-noshow-bg)',
  },
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.WAITING;

    const styles = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--font-size-small)',
        fontWeight: 'var(--font-weight-semibold)',
        color: config.color,
        backgroundColor: config.bg,
        whiteSpace: 'nowrap',
    };

    const dotStyles = {
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        backgroundColor: config.color,
        flexShrink: 0,
    };

    return (
        <span style={styles}>
            <span style={dotStyles} />
            {config.label}
        </span>
    );
};

export default StatusBadge;