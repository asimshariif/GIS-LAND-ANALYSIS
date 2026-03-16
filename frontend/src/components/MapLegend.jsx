import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function MapLegend({ categories }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categoryEntries = Object.entries(categories);

  return (
    <div style={styles.container}>
      {isCollapsed ? (
        <button style={styles.collapsedButton} onClick={() => setIsCollapsed(false)}>
          <Layers size={18} />
        </button>
      ) : (
        <div style={styles.expanded}>
          <div style={styles.header}>
            <span style={styles.title}>Land Use</span>
            <button style={styles.toggleButton} onClick={() => setIsCollapsed(true)}>
              <ChevronDown size={16} />
            </button>
          </div>
          <div style={styles.items}>
            {categoryEntries.map(([name, color]) => (
              <div key={name} style={styles.item}>
                <span style={{ ...styles.dot, background: color }} />
                <span style={styles.label}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    bottom: 30,
    left: 'calc(var(--toolbar-width) + 16px)',
    zIndex: 800,
  },
  collapsedButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'var(--panel-surface)',
    border: '1px solid var(--panel-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)',
    transition: 'all var(--transition-fast)',
  },
  expanded: {
    background: 'rgba(17, 24, 39, 0.9)',
    backdropFilter: 'blur(8px)',
    borderRadius: 12,
    border: '1px solid var(--panel-border)',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
    minWidth: 160,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid var(--panel-border)',
  },
  title: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  items: {
    padding: '8px 14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.3)',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
};
