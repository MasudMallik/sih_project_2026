import React from 'react';

interface DisasterAlertProps {
  disasterType?: string;
  location?: string;
  message?: string;
  visible: boolean;
  onClose: () => void;
}

const DisasterAlert: React.FC<DisasterAlertProps> = ({ disasterType, location, message, visible, onClose }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        minWidth: '260px',
        padding: '1rem 1.2rem',
        background: 'rgba(255, 69, 0, 0.15)', // semi‑transparent orange
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        color: '#fff',
        zIndex: 9999,
        animation: 'slideIn 0.4s ease-out',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '1.1rem' }}>⚠️ {disasterType ?? 'Disaster'} Alert</strong>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
          aria-label="Close alert"
        >
          ✕
        </button>
      </div>
      <p style={{ margin: '0.5rem 0 0' }}>{message ?? `A ${disasterType?.toLowerCase() ?? 'danger'} was reported at ${location ?? 'unknown location'}.`}</p>
    </div>
  );
};

export default DisasterAlert;
