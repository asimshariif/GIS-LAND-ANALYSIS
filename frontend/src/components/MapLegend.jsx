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
    borderRadius: 12,
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-glass)',
    transition: 'all var(--transition-fast)',
  },
  expanded: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px) saturate(200%)',
    borderRadius: 16,
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-glass)',
    overflow: 'hidden',
    minWidth: 165,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: 'rgba(255,255,255,0.6)',
  },
  title: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    background: 'rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.07)',
    transition: 'all var(--transition-fast)',
  },
  items: {
    padding: '8px 14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: '50%',
    border: '1.5px solid rgba(0,0,0,0.15)',
    flexShrink: 0,
  },
  label: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
};
