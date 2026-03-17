import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, ArrowLeft, Calculator, Ruler, MapPin, 
  Users, Store, ChevronRight, Building2, Loader
} from 'lucide-react';
import { calculateMosqueCapacity, calculateCommercialCapacity } from '../api/client';

// Only actual mosques should get the worshipper capacity calculator,
// not imam/muezzin residences which are also under Religious category.
const isMosque = (parcel) => {
  const detail = (parcel.DETAIL_LABEL_EN || '').toLowerCase();
  return parcel.LANDUSE_CATEGORY === 'Religious' && detail.includes('mosque');
};

const CATEGORY_COLORS = {
  Mosque: '#3b82f6',
  Commercial: '#f59e0b',
  Residential: '#10b981',
  Park: '#22c55e',
  Educational: '#8b5cf6',
  Government: '#ef4444',
  Unknown: '#6b7280',
};

export default function ParcelDetailDrawer({
  isOpen,
  onClose,
  mode, // 'query' | 'detail' | 'calculator'
  queriedParcels = [],
  activeCategory,
  selectedParcel,
  onParcelSelect,
  onHighlightParcel,
  onBackToQuery,
  onCapacityCalculated, // called when a capacity calculation result is ready
}) {
  const [calculatorMode, setCalculatorMode] = useState(null); // 'religious' | 'commercial'
  const [shopSize, setShopSize] = useState(120);

  // Reset calculator mode when a different parcel is selected (e.g. clicking another map point)
  useEffect(() => {
    setCalculatorMode(null);
  }, [selectedParcel?.PARCEL_ID]);

  const drawerTitle = useMemo(() => {
    if (calculatorMode === 'religious') return 'Religious Facility Capacity Calculator';
    if (calculatorMode === 'commercial') return 'Commercial Plot Capacity';
    if (mode === 'query') return `Query Results: ${activeCategory} (${queriedParcels.length})`;
    if (mode === 'detail') return 'Parcel Detail';
    return 'Parcel Details';
  }, [mode, activeCategory, queriedParcels.length, calculatorMode]);

  if (!isOpen) return null;

  const handleParcelClick = (parcel) => {
    onHighlightParcel(parcel.PARCEL_ID);
  };

  const handleCalculateClick = (parcel) => {
    onParcelSelect(parcel);
    if (isMosque(parcel)) {
      setCalculatorMode('religious');
    } else if (parcel.LANDUSE_CATEGORY === 'Commercial') {
      setCalculatorMode('commercial');
    }
  };

  const handleBack = () => {
    if (calculatorMode) {
      setCalculatorMode(null);
    } else if (mode === 'detail' && onBackToQuery) {
      onBackToQuery();
    }
  };

  const showBackButton = calculatorMode || (mode === 'detail' && queriedParcels.length > 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {showBackButton && (
            <button style={styles.backButton} onClick={handleBack}>
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 style={styles.title}>{drawerTitle}</h2>
        </div>
        <button style={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {calculatorMode === 'religious' && selectedParcel && (
          <MosqueCalculator parcel={selectedParcel} onCalculated={onCapacityCalculated} />
        )}
        
        {calculatorMode === 'commercial' && selectedParcel && (
          <CommercialCalculator 
            parcel={selectedParcel} 
            shopSize={shopSize}
            setShopSize={setShopSize}
            onCalculated={onCapacityCalculated}
          />
        )}
        
        {!calculatorMode && mode === 'query' && (
          <QueryResultsList
            parcels={queriedParcels}
            category={activeCategory}
            onParcelClick={handleParcelClick}
            onCalculateClick={handleCalculateClick}
            onViewDetail={(parcel) => {
              onParcelSelect(parcel);
            }}
          />
        )}
        
        {!calculatorMode && mode === 'detail' && selectedParcel && (
          <ParcelDetail 
            parcel={selectedParcel}
            onCalculate={() => {
              if (isMosque(selectedParcel)) {
                setCalculatorMode('religious');
              } else if (selectedParcel.LANDUSE_CATEGORY === 'Commercial') {
                setCalculatorMode('commercial');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

// Query Results List Component
function QueryResultsList({ parcels, category, onParcelClick, onCalculateClick, onViewDetail }) {
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Unknown;

  return (
    <div style={styles.queryResults}>
      <div style={styles.resultsSummary}>
        <div style={{ ...styles.categoryDot, background: categoryColor }} />
        <span>{parcels.length} parcels found</span>
      </div>

      <div style={styles.parcelList}>
        {parcels.map((parcel) => {
          const isVacant = (parcel.PARCEL_STATUS_LABEL || parcel.PARCEL_STATUS_LABEL_EN || '').toLowerCase().includes('vacant');
          const canCalculate = isMosque(parcel) || parcel.LANDUSE_CATEGORY === 'Commercial';

          return (
            <div
              key={parcel.PARCEL_ID}
              style={styles.parcelCard}
              onClick={() => onParcelClick(parcel)}
            >
              <div style={styles.parcelHeader}>
                <span style={styles.parcelLabel}>
                  {parcel.SUBTYPE_LABEL_EN || 'Unnamed'}
                </span>
                <span style={{
                  ...styles.statusBadge,
                  background: isVacant ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isVacant ? '#f59e0b' : '#10b981',
                }}>
                  {isVacant ? 'Vacant' : 'Developed'}
                </span>
              </div>
              
              {parcel.SUBTYPE_LABEL_AR && (
                <div style={styles.parcelLabelAr}>{parcel.SUBTYPE_LABEL_AR}</div>
              )}
              
              <div style={styles.parcelMeta}>
                <span style={styles.metaItem}>
                  <Ruler size={12} />
                  {Number(parcel.AREA_M2 || 0).toLocaleString()} m²
                </span>
              </div>

              <div style={styles.cardActions}>
                <button 
                  style={styles.viewButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(parcel);
                  }}
                >
                  View Details
                  <ChevronRight size={14} />
                </button>
                {canCalculate && (
                  <button 
                    style={styles.calculateButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCalculateClick(parcel);
                    }}
                  >
                    <Calculator size={14} />
                    Calculate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Parcel Detail Component
function ParcelDetail({ parcel, onCalculate }) {
  const categoryColor = CATEGORY_COLORS[parcel.LANDUSE_CATEGORY] || CATEGORY_COLORS.Unknown;
  const canCalculate = isMosque(parcel) || parcel.LANDUSE_CATEGORY === 'Commercial';
  const isVacant = (parcel.PARCEL_STATUS_LABEL || parcel.PARCEL_STATUS_LABEL_EN || '').toLowerCase().includes('vacant');

  const fields = [
    { label: 'Parcel ID', value: parcel.PARCEL_ID },
    { label: 'Subtype (EN)', value: parcel.SUBTYPE_LABEL_EN },
    { label: 'Subtype (AR)', value: parcel.SUBTYPE_LABEL_AR },
    { label: 'Category', value: parcel.LANDUSE_CATEGORY, color: categoryColor },
    { label: 'Area (m²)', value: parcel.AREA_M2 ? Number(parcel.AREA_M2).toLocaleString() : 'N/A' },
    { label: 'Status', value: parcel.PARCEL_STATUS_LABEL || parcel.PARCEL_STATUS_LABEL_EN },
    { label: 'Block ID', value: parcel.BLOCK_NO || parcel.BLOCK_ID },
    { label: 'Municipality', value: parcel.MUNICIPALITY_LABEL_EN || parcel.MUNICIPALITY_LABEL_AR },
  ];

  return (
    <div style={styles.parcelDetails}>
      <div style={styles.detailHeader}>
        <div style={{ ...styles.categoryBadge, background: categoryColor }}>
          {parcel.LANDUSE_CATEGORY || 'Unknown'}
        </div>
        <span style={{
          ...styles.statusBadge,
          background: isVacant ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: isVacant ? '#f59e0b' : '#10b981',
        }}>
          {isVacant ? 'Vacant' : 'Developed'}
        </span>
      </div>

      <div style={styles.detailsGrid}>
        {fields.map(({ label, value, color }) => value && (
          <div key={label} style={styles.detailField}>
            <div style={styles.fieldLabel}>{label}</div>
            <div style={{ ...styles.fieldValue, color: color || 'var(--text-primary)' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {canCalculate && (
        <button style={styles.calculateCapacityButton} onClick={onCalculate}>
          <Calculator size={18} />
          Calculate Capacity
        </button>
      )}
    </div>
  );
}

// Religious Facility Calculator Component
function MosqueCalculator({ parcel, onCalculated }) {
  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const area = Number(parcel.AREA_M2) || 0;
  const isVacant = (parcel.PARCEL_STATUS_LABEL || parcel.PARCEL_STATUS_LABEL_EN || '').toLowerCase().includes('vacant');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    calculateMosqueCapacity(parcel.PARCEL_ID)
      .then(result => {
        if (!cancelled) {
          setCalcResult(result);
          // Notify parent so it can be included in the report
          if (onCalculated) {
            onCalculated({
              type: 'mosque',
              parcel_id: parcel.PARCEL_ID,
              subtype: parcel.SUBTYPE_LABEL_EN || 'Religious Facility',
              area_m2: area,
              capacity_worshippers: result.capacity_worshippers ?? 0,
              rate_m2_per_worshipper: result.rate_m2_per_worshipper ?? 8.0,
              floors_estimated: result.floors_estimated ?? 1,
            });
          }
        }
      })
      .catch(err => {
        if (!cancelled) setError('Failed to calculate capacity');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [parcel.PARCEL_ID]);

  const capacity = calcResult?.capacity_worshippers ?? 0;
  const rate = calcResult?.rate_m2_per_worshipper ?? 8.0;

  return (
    <div style={styles.calculator}>
      <div style={styles.calcHeader}>
        <Church size={24} color="#3b82f6" />
        <div>
          <div style={styles.calcLabel}>{parcel.SUBTYPE_LABEL_EN || 'Religious Facility'}</div>
          <div style={styles.calcArea}>{area.toLocaleString()} m²</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8, color: 'var(--text-secondary)' }}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Calculating...</span>
        </div>
      ) : error ? (
        <div style={{ padding: 16, color: '#ef4444', textAlign: 'center' }}>{error}</div>
      ) : (
        <>
          <div style={styles.formulaBox}>
            <div style={styles.formulaTitle}>Capacity Formula</div>
            <div style={styles.formula}>
              <span>{area.toLocaleString()} m²</span>
              <span style={styles.formulaOperator}>÷</span>
              <span>{rate} m²/worshipper</span>
              <span style={styles.formulaOperator}>=</span>
              <span style={styles.formulaResult}>{capacity.toLocaleString()}</span>
            </div>
          </div>

          <div style={styles.resultBox}>
            <div style={styles.resultValue}>{capacity.toLocaleString()}</div>
            <div style={styles.resultLabel}>estimated worshippers</div>
          </div>

          <div style={styles.calcNote}>
            Based on mosque prayer density of {rate} m² per worshipper
          </div>

          <div style={styles.statusNote}>
            <div style={{
              ...styles.statusIndicator,
              background: isVacant ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            }}>
              <span style={{ color: isVacant ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                {isVacant ? 'Vacant Plot' : 'Developed'}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {isVacant 
                  ? 'Full capacity available for development'
                  : 'Existing mosque with current capacity'
                }
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Church icon for mosque
function Church({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/>
      <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
      <path d="M18 22V5l-6-3-6 3v17"/>
      <path d="M12 7v5"/>
      <path d="M10 9h4"/>
    </svg>
  );
}

// Commercial Calculator Component
function CommercialCalculator({ parcel, shopSize, setShopSize, onCalculated }) {
  const area = Number(parcel.AREA_M2) || 0;
  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch calculation from backend whenever shopSize changes (debounced)
  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(null);
      calculateCommercialCapacity(parcel.PARCEL_ID, shopSize)
        .then(result => {
          if (!cancelled) {
            setCalcResult(result);
            // Notify parent for report context
            if (onCalculated) {
              onCalculated({
                type: 'commercial',
                parcel_id: parcel.PARCEL_ID,
                subtype: parcel.SUBTYPE_LABEL_EN || 'Commercial',
                area_m2: area,
                shops_estimated: result.shop_count ?? Math.floor(area / shopSize),
                shop_size_m2: shopSize,
                floors_estimated: result.floors_estimated ?? 1,
              });
            }
          }
        })
        .catch(() => {
          if (!cancelled) setError('Failed to calculate');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [parcel.PARCEL_ID, shopSize]);

  const estimatedShops = calcResult?.shop_count ?? Math.floor(area / shopSize);

  return (
    <div style={styles.calculator}>
      <div style={styles.calcHeader}>
        <Building2 size={24} color="#f59e0b" />
        <div>
          <div style={styles.calcLabel}>{parcel.SUBTYPE_LABEL_EN || 'Commercial'}</div>
          <div style={styles.calcArea}>{area.toLocaleString()} m²</div>
        </div>
      </div>

      <div style={styles.inputSection}>
        <label style={styles.inputLabel}>Shop Size (m²)</label>
        <input
          type="number"
          value={shopSize}
          onChange={(e) => setShopSize(Number(e.target.value) || 120)}
          style={styles.shopSizeInput}
          min={20}
          max={500}
        />
        <input
          type="range"
          value={shopSize}
          onChange={(e) => setShopSize(Number(e.target.value))}
          style={styles.slider}
          min={20}
          max={500}
          step={10}
        />
        <div style={styles.sliderLabels}>
          <span>20m² (kiosk)</span>
          <span>500m² (large store)</span>
        </div>
      </div>

      <div style={styles.resultBox}>
        {loading ? (
          <Loader size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
        ) : (
          <>
            <div style={styles.resultValue}>{estimatedShops.toLocaleString()}</div>
            <div style={styles.resultLabel}>shops estimated</div>
          </>
        )}
      </div>

      {error && (
        <div style={{ padding: 8, color: '#ef4444', fontSize: '0.8rem', textAlign: 'center' }}>{error}</div>
      )}

      <div style={styles.presetComparisons}>
        <div style={styles.presetTitle}>Quick Comparisons</div>
        <div style={styles.presetGrid}>
          <div style={styles.presetItem} onClick={() => setShopSize(60)}>
            <div style={styles.presetValue}>{Math.floor(area / 60)}</div>
            <div style={styles.presetLabel}>at 60m²</div>
          </div>
          <div style={styles.presetItem} onClick={() => setShopSize(120)}>
            <div style={styles.presetValue}>{Math.floor(area / 120)}</div>
            <div style={styles.presetLabel}>at 120m²</div>
          </div>
          <div style={styles.presetItem} onClick={() => setShopSize(200)}>
            <div style={styles.presetValue}>{Math.floor(area / 200)}</div>
            <div style={styles.presetLabel}>at 200m²</div>
          </div>
        </div>
      </div>

      <div style={styles.calcNote}>
        Adjust shop size to reflect local retail standards or your development brief
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 'var(--drawer-width)',
    background: 'var(--glass-bg-dense)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderLeft: '1px solid var(--glass-border)',
    zIndex: 900,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.10)',
    animation: 'slideInFromRight 0.25s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: 'rgba(255,255,255,0.8)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    background: 'rgba(0,0,0,0.06)',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all var(--transition-fast)',
  },
  title: {
    margin: 0,
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.01em',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    background: 'rgba(0,0,0,0.06)',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all var(--transition-fast)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px',
  },

  // Query Results
  queryResults: {},
  resultsSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: 500,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  parcelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  parcelCard: {
    padding: '12px 14px',
    background: '#ffffff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  parcelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  parcelLabel: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  parcelLabelAr: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    marginBottom: 6,
    direction: 'rtl',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: '0.68rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  parcelMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  cardActions: {
    display: 'flex',
    gap: 6,
  },
  viewButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '6px 10px',
    borderRadius: 8,
    background: 'rgba(0,0,0,0.05)',
    color: 'var(--text-primary)',
    fontSize: '0.75rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  calculateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: '0 2px 6px rgba(59,130,246,0.35)',
  },

  // Parcel Details
  parcelDetails: {},
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  categoryBadge: {
    padding: '4px 12px',
    borderRadius: 999,
    color: 'white',
    fontWeight: 700,
    fontSize: '0.78rem',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14,
  },
  detailField: {
    padding: '9px 12px',
    background: '#ffffff',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  fieldLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 2,
    fontWeight: 600,
  },
  fieldValue: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  calculateCapacityButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    fontSize: '0.88rem',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
  },

  // Calculator
  calculator: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  calcHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    background: '#ffffff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  calcLabel: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  calcArea: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  formulaBox: {
    padding: '14px',
    background: 'rgba(59,130,246,0.05)',
    borderRadius: 12,
    border: '1px solid rgba(59,130,246,0.15)',
  },
  formulaTitle: {
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 700,
    marginBottom: 8,
  },
  formula: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: '0.88rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  },
  formulaOperator: {
    color: 'var(--text-tertiary)',
  },
  formulaResult: {
    fontWeight: 800,
    color: '#3b82f6',
  },
  resultBox: {
    padding: '24px 20px',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(29,78,216,0.04))',
    borderRadius: 16,
    border: '1px solid rgba(59,130,246,0.20)',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
  },
  resultValue: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#1d4ed8',
    lineHeight: 1,
    marginBottom: 4,
    letterSpacing: '-0.04em',
  },
  resultLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  calcNote: {
    fontSize: '0.73rem',
    color: 'var(--text-tertiary)',
    textAlign: 'center',
    padding: '0 10px',
    fontStyle: 'italic',
  },
  statusNote: {
    padding: '0 2px',
  },
  statusIndicator: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.06)',
  },
  comparisonSection: {
    padding: '14px',
    background: '#ffffff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  comparisonTitle: {
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 700,
    marginBottom: 12,
  },
  comparisonChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  comparisonBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  comparisonLabel: {
    width: 80,
    fontSize: '0.73rem',
    color: 'var(--text-secondary)',
  },
  barContainer: {
    flex: 1,
    height: 8,
    background: 'rgba(0,0,0,0.07)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 999,
  },
  barValue: {
    width: 60,
    fontSize: '0.73rem',
    color: 'var(--text-secondary)',
    textAlign: 'right',
  },

  // Commercial Calculator
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  inputLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  shopSizeInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid rgba(0,0,0,0.12)',
    background: '#ffffff',
    color: 'var(--text-primary)',
    fontSize: '1.4rem',
    fontWeight: 800,
    textAlign: 'center',
    letterSpacing: '-0.02em',
    outline: 'none',
  },
  slider: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    cursor: 'pointer',
    appearance: 'none',
    accentColor: '#3b82f6',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
  },
  presetComparisons: {
    padding: '14px',
    background: '#ffffff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  presetTitle: {
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 700,
    marginBottom: 10,
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  presetItem: {
    padding: '10px',
    background: 'rgba(0,0,0,0.04)',
    borderRadius: 10,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    border: '1px solid transparent',
  },
  presetValue: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  presetLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
  },
};
