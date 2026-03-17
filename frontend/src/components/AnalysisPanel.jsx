import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, MapPin, Eye, FileText } from 'lucide-react';

const CATEGORY_COLORS = {
  Mosque: '#3b82f6',
  Commercial: '#f59e0b',
  Residential: '#10b981',
  Park: '#22c55e',
  Educational: '#8b5cf6',
  Government: '#ef4444',
};

const AnalysisPanel = ({ results, selectionData, onZoomToBlock, onBlockReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('block_id');
  const [sortDir, setSortDir] = useState('asc');

  // Generate block-level data from selection
  const blockData = useMemo(() => {
    if (!selectionData?.parcels) return [];
    
    const blocks = {};
    selectionData.parcels.forEach(parcel => {
      const blockId = parcel.BLOCK_NO || parcel.BLOCK_ID || 'Unknown';
      if (!blocks[blockId]) {
        blocks[blockId] = {
          block_id: blockId,
          total_parcels: 0,
          total_area: 0,
          vacant_count: 0,
          mosque_count: 0,
          mosque_area: 0,
          commercial_count: 0,
          commercial_area: 0,
          residential_count: 0,
          centroid: null,
        };
      }
      blocks[blockId].total_parcels++;
      blocks[blockId].total_area += Number(parcel.AREA_M2) || 0;
      
      const status = (parcel.PARCEL_STATUS_LABEL || parcel.PARCEL_STATUS_LABEL_EN || '').toLowerCase();
      if (status.includes('vacant')) blocks[blockId].vacant_count++;
      
      const cat = parcel.LANDUSE_CATEGORY;
      const area = Number(parcel.AREA_M2) || 0;
      if (cat === 'Religious') {
        blocks[blockId].mosque_count++;
        blocks[blockId].mosque_area += area;
      } else if (cat === 'Commercial') {
        blocks[blockId].commercial_count++;
        blocks[blockId].commercial_area += area;
      } else if (cat === 'Residential') {
        blocks[blockId].residential_count++;
      }
      
      // Accumulate coords for block centroid
      const lat = Number(parcel.REPR_LAT);
      const lon = Number(parcel.REPR_LON);
      if (lat && lon) {
        if (!blocks[blockId]._lats) { blocks[blockId]._lats = []; blocks[blockId]._lons = []; }
        blocks[blockId]._lats.push(lat);
        blocks[blockId]._lons.push(lon);
      }
    });
    
    // Add computed values for sorting + centroid from averaged coords
    return Object.values(blocks).map(block => {
      const lats = block._lats || [];
      const lons = block._lons || [];
      const centroid = lats.length
        ? [lats.reduce((a, b) => a + b, 0) / lats.length, lons.reduce((a, b) => a + b, 0) / lons.length]
        : null;
      delete block._lats;
      delete block._lons;
      return {
        ...block,
        centroid,
        mosque_capacity: Math.floor(block.mosque_area / 8),
        est_shops: Math.floor(block.commercial_area / 120),
      };
    });
  }, [selectionData]);

  // Filter and sort
  const filteredData = useMemo(() => {
    let data = [...blockData];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(b => String(b.block_id).toLowerCase().includes(term));
    }
    
    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    
    return data;
  }, [blockData, searchTerm, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (!selectionData?.parcels?.length) {
    return (
      <div style={styles.emptyState}>
        <MapPin size={32} style={{ opacity: 0.4 }} />
        <p>Draw a selection to see block analysis</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Search */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <span style={styles.resultCount}>{filteredData.length} blocks</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {[
                { label: 'Block', field: 'block_id', w: '10%' },
                { label: 'Parcels', field: 'total_parcels', w: '9%' },
                { label: 'Mosque', field: 'mosque_count', w: '10%' },
                { label: 'Comm.', field: 'commercial_count', w: '10%' },
                { label: 'Resid.', field: 'residential_count', w: '10%' },
                { label: 'Msq Cap.', field: 'mosque_capacity', w: '11%' },
                { label: 'Shops', field: 'est_shops', w: '9%' },
                { label: 'Vacant', field: 'vacant_count', w: '9%' },
              ].map(col => (
                <th key={col.field} style={{ ...styles.th, width: col.w }} onClick={() => toggleSort(col.field)}>
                  <div style={styles.thInner}>
                    <span>{col.label}</span>
                    <SortIcon field={col.field} />
                  </div>
                </th>
              ))}
              <th style={{ ...styles.th, width: '12%', cursor: 'default' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((block) => (
                <tr key={block.block_id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.blockId}>{block.block_id}</span>
                  </td>
                  <td style={styles.td}>{block.total_parcels}</td>
                  <td style={styles.td}>
                    <span style={{ color: block.mosque_count > 0 ? CATEGORY_COLORS.Mosque : 'var(--text-secondary)', fontWeight: block.mosque_count > 0 ? 600 : 400 }}>
                      {block.mosque_count}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: block.commercial_count > 0 ? CATEGORY_COLORS.Commercial : 'var(--text-secondary)', fontWeight: block.commercial_count > 0 ? 600 : 400 }}>
                      {block.commercial_count}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: block.residential_count > 0 ? CATEGORY_COLORS.Residential : 'var(--text-secondary)', fontWeight: block.residential_count > 0 ? 600 : 400 }}>
                      {block.residential_count}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: block.mosque_capacity > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {block.mosque_capacity.toLocaleString()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: block.est_shops > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {block.est_shops.toLocaleString()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.vacantBadge,
                      opacity: block.vacant_count > 0 ? 1 : 0.3,
                    }}>
                      {block.vacant_count}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.viewButton}
                        onClick={() => onZoomToBlock && onZoomToBlock(block)}
                        title="Zoom to block"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        style={styles.reportButton}
                        onClick={() => onBlockReport && onBlockReport(block)}
                        title="Generate block report"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div style={styles.footer}>
        <div style={styles.footerStat}>
          <span style={styles.footerLabel}>Total Parcels</span>
          <span style={styles.footerValue}>{selectionData.parcels.length}</span>
        </div>
        <div style={styles.footerStat}>
          <span style={styles.footerLabel}>Total Area</span>
          <span style={styles.footerValue}>
            {(selectionData.parcels.reduce((s, p) => s + (Number(p.AREA_M2) || 0), 0) / 10000).toFixed(2)} ha
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'rgba(248, 250, 252, 0.6)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: 'rgba(255,255,255,0.85)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.07)',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    width: 150,
  },
  resultCount: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
    tableLayout: 'fixed',
  },
  th: {
    padding: '9px 12px',
    textAlign: 'left',
    background: 'rgba(248,250,252,0.97)',
    color: 'var(--text-tertiary)',
    fontWeight: 700,
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    userSelect: 'none',
    position: 'sticky',
    top: 0,
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    whiteSpace: 'nowrap',
  },
  thInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  categoryTh: {
    cursor: 'default',
  },
  tr: {
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    transition: 'background var(--transition-fast)',
    background: '#ffffff',
  },
  td: {
    padding: '9px 12px',
    color: 'var(--text-primary)',
  },
  blockId: {
    fontWeight: 700,
    color: 'var(--accent-blue)',
  },
  vacantBadge: {
    padding: '2px 8px',
    background: 'rgba(217,119,6,0.10)',
    color: '#d97706',
    borderRadius: 5,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  categoryDots: {
    display: 'flex',
    gap: 4,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  actionButtons: {
    display: 'flex',
    gap: 6,
  },
  viewButton: {
    width: 28,
    height: 28,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.07)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  reportButton: {
    width: 28,
    height: 28,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: '0 2px 6px rgba(59,130,246,0.35)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.9)',
    borderTop: '1px solid rgba(0,0,0,0.07)',
  },
  footerStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  footerLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontWeight: 600,
  },
  footerValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
};

export default AnalysisPanel;
