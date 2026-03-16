import React from 'react';
import { Pentagon, Square, Trash2, MousePointer2 } from 'lucide-react';

export default function LeftToolbar({ drawMode, onDrawModeChange, onClearSelection, hasSelection, queryMode, onQueryModeToggle }) {
  const tools = [
    { id: 'polygon', icon: Pentagon, label: 'Draw Polygon' },
    { id: 'rectangle', icon: Square, label: 'Draw Rectangle' },
  ];

  return (
    <div style={styles.container}>
      {/* Draw Tools */}
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          style={{
            ...styles.button,
            ...(drawMode === id ? styles.buttonActive : {}),
          }}
          onClick={() => onDrawModeChange(id)}
          title={label}
        >
          <Icon size={20} />
        </button>
      ))}

      {/* Separator */}
      <div style={styles.separator} />

      {/* Clear Selection */}
      <button
        style={{
          ...styles.button,
          ...(hasSelection ? styles.buttonDanger : styles.buttonDisabled),
        }}
        onClick={onClearSelection}
        disabled={!hasSelection}
        title="Clear Selection"
      >
        <Trash2 size={20} />
      </button>

      {/* Separator */}
      <div style={styles.separator} />

      {/* Query Mode */}
      <button
        style={{
          ...styles.button,
          ...(queryMode ? styles.buttonActive : {}),
          ...(hasSelection ? {} : styles.buttonDisabled),
        }}
        onClick={onQueryModeToggle}
        disabled={!hasSelection}
        title="Query Mode"
      >
        <MousePointer2 size={20} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 'calc(var(--topbar-height) + 20px)',
    left: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 900,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: 'var(--panel-surface)',
    border: '1px solid var(--panel-border)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
  },
  buttonActive: {
    background: 'var(--accent-blue)',
    borderColor: 'var(--accent-blue)',
    color: 'white',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
  },
  buttonDanger: {
    borderColor: 'var(--danger-rose)',
    color: 'var(--danger-rose)',
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  separator: {
    width: '100%',
    height: 1,
    background: 'var(--panel-border)',
    margin: '4px 0',
  },
};
