import React from 'react';
import { Pentagon, Square, Trash2 } from 'lucide-react';

export default function LeftToolbar({ drawMode, onDrawModeChange, onClearSelection, hasSelection }) {
  const tools = [
    { id: 'polygon', icon: Pentagon, label: 'Draw Polygon' },
    { id: 'rectangle', icon: Square, label: 'Draw Rectangle' },
  ];

  return (
    <div style={styles.container}>
      {/* Draw Tools */}
      <div style={styles.group}>
        {tools.map(({ id, icon: Icon, label }) => (
          <ToolButton
            key={id}
            label={label}
            active={drawMode === id}
            onClick={() => onDrawModeChange(id)}
          >
            <Icon size={17} />
          </ToolButton>
        ))}
      </div>

      <div style={styles.separator} />

      {/* Clear Selection & Polygon */}
      <div style={styles.group}>
        <ToolButton
          label="Clear Selection"
          danger={hasSelection}
          disabled={!hasSelection}
          onClick={onClearSelection}
        >
          <Trash2 size={17} />
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({ children, label, active, danger, disabled, onClick }) {
  return (
    <button
      style={{
        ...styles.button,
        ...(active ? styles.buttonActive : {}),
        ...(danger ? styles.buttonDanger : {}),
        ...(disabled ? styles.buttonDisabled : {}),
      }}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      {children}
    </button>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 'calc(var(--topbar-height) + 14px)',
    left: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    zIndex: 900,
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid var(--glass-border)',
    borderRadius: 18,
    padding: '7px',
    boxShadow: 'var(--shadow-glass)',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  buttonActive: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    borderColor: 'transparent',
    color: 'white',
    boxShadow: '0 2px 8px rgba(59,130,246,0.45)',
  },
  buttonDanger: {
    color: '#dc2626',
    background: 'rgba(220,38,38,0.07)',
  },
  buttonDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  separator: {
    width: '100%',
    height: 1,
    background: 'rgba(0,0,0,0.07)',
    margin: '2px 0',
  },
};
