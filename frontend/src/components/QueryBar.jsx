import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

const CAT_COLORS = {
  Residential: '#10b981', Commercial: '#f59e0b', Religious: '#3b82f6',
  Educational: '#8b5cf6', Health: '#ec4899',     Municipal: '#ef4444',
  Recreational:'#22c55e', Utilities: '#6366f1',  Special: '#a855f7',
  Unknown: '#94a3b8',
};

export default function QueryBar({
  selectionSummary,
  activeCategory,
  onCategorySelect,
  selectedObjectIds,
  queriedParcels,
}) {
  const [searchText, setSearchText] = useState('');

  const categories = useMemo(() => {
    if (!selectionSummary?.category_breakdown) return [];
    return Object.entries(selectionSummary.category_breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [selectionSummary]);

  const filteredParcels = useMemo(() => {
    if (!searchText.trim() || !queriedParcels?.length) return queriedParcels;
    const q = searchText.toLowerCase();
    return queriedParcels.filter(
      p => p.SUBTYPE_LABEL_EN?.toLowerCase().includes(q) ||
           p.DETAIL_LABEL_EN?.toLowerCase().includes(q)
    );
  }, [queriedParcels, searchText]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.capsule}>
        {/* Category pills */}
        <div style={styles.pills}>
          {categories.map(({ name, count }) => {
            const color = CAT_COLORS[name] || '#94a3b8';
            const isActive = activeCategory === name;
            return (
              <button
                key={name}
                style={{
                  ...styles.pill,
                  ...(isActive ? { background: `${color}15`, borderColor: color, borderWidth: 1.5 } : {}),
                }}
                onClick={() => onCategorySelect(name)}
              >
                <span style={{ ...styles.dot, background: color }} />
                <span style={styles.pillName}>{name}</span>
                <span style={{ ...styles.pillCount, color: isActive ? color : 'var(--text-tertiary)' }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.divider} />

        {/* Search */}
        <div style={styles.search}>
          <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Filter by name…"
            style={styles.input}
          />
          {searchText && (
            <button style={styles.clearBtn} onClick={() => setSearchText('')}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {activeCategory && searchText && filteredParcels && (
        <div style={styles.hint}>
          {filteredParcels.length} of {queriedParcels?.length || 0} {activeCategory} parcels
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'absolute',
    top: 'calc(var(--topbar-height) + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 950,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  capsule: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 10px',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px) saturate(200%)',
    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
    border: '1px solid var(--glass-border)',
    borderRadius: 999,
    boxShadow: 'var(--shadow-lg)',
    maxWidth: '90vw',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  pills: {
    display: 'flex',
    gap: 5,
    overflowX: 'auto',
    flexShrink: 1,
    minWidth: 0,
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px',
    borderRadius: 999,
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid transparent',
    color: 'var(--text-primary)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  pillName: {
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  pillCount: {
    fontWeight: 700,
    fontSize: '0.72rem',
  },
  divider: {
    width: 1,
    height: 20,
    background: 'rgba(0,0,0,0.09)',
    flexShrink: 0,
  },
  search: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 6px',
    background: 'rgba(0,0,0,0.04)',
    borderRadius: 999,
    border: '1px solid rgba(0,0,0,0.06)',
    minWidth: 150,
  },
  input: {
    flex: 1,
    fontSize: '0.78rem',
    color: 'var(--text-primary)',
    minWidth: 0,
    background: 'transparent',
    border: 'none',
    outline: 'none',
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.08)',
    color: 'var(--text-tertiary)',
    flexShrink: 0,
    cursor: 'pointer',
    border: 'none',
  },
  hint: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '3px 12px',
    borderRadius: 999,
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-sm)',
  },
};

