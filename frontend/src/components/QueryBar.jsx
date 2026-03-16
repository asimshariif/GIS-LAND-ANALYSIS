import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

const CATEGORY_COLORS = {
  Mosque: '#3b82f6',
  Commercial: '#f59e0b',
  Residential: '#10b981',
  Park: '#22c55e',
  Educational: '#8b5cf6',
  Government: '#ef4444',
  Unknown: '#6b7280',
};

export default function QueryBar({
  selectionSummary,
  activeCategory,
  onCategorySelect,
  selectedObjectIds,
  queriedParcels,
}) {
  const [searchText, setSearchText] = useState('');

  // Get categories from the selection summary
  const categories = useMemo(() => {
    if (!selectionSummary?.category_breakdown) return [];
    return Object.entries(selectionSummary.category_breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [selectionSummary]);

  // Filter parcels by text search (client-side)
  const filteredParcels = useMemo(() => {
    if (!searchText.trim() || !queriedParcels?.length) return queriedParcels;
    const query = searchText.toLowerCase();
    return queriedParcels.filter(
      (p) =>
        p.SUBTYPE_LABEL_EN?.toLowerCase().includes(query) ||
        p.DETAIL_LABEL_EN?.toLowerCase().includes(query)
    );
  }, [queriedParcels, searchText]);

  const handleClearSearch = () => {
    setSearchText('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Category Pills */}
        <div style={styles.pillsContainer}>
          {categories.map(({ name, count }) => {
            const color = CATEGORY_COLORS[name] || CATEGORY_COLORS.Unknown;
            const isActive = activeCategory === name;

            return (
              <button
                key={name}
                style={{
                  ...styles.pill,
                  ...(isActive ? { ...styles.pillActive, borderColor: color } : {}),
                }}
                onClick={() => onCategorySelect(name)}
              >
                <span style={{ ...styles.pillDot, background: color }} />
                <span style={styles.pillName}>{name}</span>
                <span style={styles.pillCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Text Search */}
        <div style={styles.searchContainer}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Filter by name..."
            style={styles.searchInput}
          />
          {searchText && (
            <button style={styles.clearButton} onClick={handleClearSearch}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filtered results indicator */}
      {activeCategory && searchText && filteredParcels && (
        <div style={styles.filterIndicator}>
          Showing {filteredParcels.length} of {queriedParcels?.length || 0} {activeCategory} parcels
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 'calc(var(--topbar-height) + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 950,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 12px',
    background: 'var(--panel-surface)',
    borderRadius: 12,
    border: '1px solid var(--panel-border)',
    boxShadow: 'var(--shadow-lg)',
  },
  pillsContainer: {
    display: 'flex',
    gap: 8,
    flexWrap: 'nowrap',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 20,
    background: 'var(--bg-deep-navy)',
    border: '1px solid var(--panel-border)',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
  },
  pillActive: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 2,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  pillName: {
    fontWeight: 500,
  },
  pillCount: {
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    background: 'var(--bg-deep-navy)',
    borderRadius: 8,
    border: '1px solid var(--panel-border)',
    minWidth: 160,
  },
  searchIcon: {
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    minWidth: 100,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  filterIndicator: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    background: 'var(--panel-surface)',
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid var(--panel-border)',
  },
};
