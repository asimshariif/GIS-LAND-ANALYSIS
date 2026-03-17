import React, { useState } from 'react';
import { X, Download, FileText, Loader, AlertCircle, ChevronDown, ChevronUp, TrendingUp, MapPin, BarChart2, Users } from 'lucide-react';
import { generatePdfReport } from '../api/client';

const CAT_COLORS = {
  Residential: '#10b981', Commercial: '#f59e0b', Religious: '#3b82f6',
  Educational: '#8b5cf6', Health: '#ec4899',     Municipal: '#ef4444',
  Recreational:'#22c55e', Utilities: '#6366f1',  Special: '#a855f7',
  Unknown: '#94a3b8',
};

export default function ReportViewer({ 
  isOpen, 
  onClose, 
  reportData,
  selectionData,
  isLoading,
  error
}) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    landUse: true,
    capacity: true,
    insights: true,
  });
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDownloadPdf = async () => {
    if (!selectionData) return;
    setDownloadingPdf(true);
    try {
      const response = await generatePdfReport(selectionData);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `land_analysis_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Parse statistics from selection data
  const stats = selectionData ? {
    totalParcels: selectionData.parcels?.length || 0,
    totalArea: selectionData.parcels?.reduce((s, p) => s + (Number(p.AREA_M2) || 0), 0) || 0,
    vacantCount: selectionData.parcels?.filter(p => (p.PARCEL_STATUS_LABEL || p.PARCEL_STATUS_LABEL_EN || '').toLowerCase().includes('vacant')).length || 0,
    categories: {},
  } : null;

  if (stats && selectionData?.parcels) {
    selectionData.parcels.forEach(p => {
      const cat = p.LANDUSE_CATEGORY || 'Unknown';
      stats.categories[cat] = (stats.categories[cat] || 0) + 1;
    });
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <FileText size={18} color="white" />
            </div>
            <div>
              <h1 style={styles.title}>Land Analysis Report</h1>
              <span style={styles.subtitle}>AI-Generated Insights</span>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              style={{ ...styles.downloadBtn, ...(downloadingPdf || isLoading ? styles.btnDisabled : {}) }}
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || isLoading}
            >
              {downloadingPdf ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
              <span>Download PDF</span>
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {isLoading && (
            <div style={styles.centerState}>
              <div style={styles.spinnerRing}>
                <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
              </div>
              <p style={styles.stateTitle}>Generating AI Report…</p>
              <span style={styles.stateHint}>This may take 15–30 seconds</span>
            </div>
          )}

          {error && (
            <div style={styles.centerState}>
              <AlertCircle size={40} color="#dc2626" />
              <p style={styles.stateTitle}>Failed to generate report</p>
              <span style={{ ...styles.stateHint, color: '#dc2626' }}>{error}</span>
            </div>
          )}

          {!isLoading && !error && stats && (
            <>
              <Section
                title="Selection Overview"
                icon={<BarChart2 size={16} color="#3b82f6" />}
                expanded={expandedSections.overview}
                onToggle={() => toggleSection('overview')}
              >
                <div style={styles.kpiGrid}>
                  {[
                    { v: stats.totalParcels.toLocaleString(), l: 'Total Parcels', c: '#3b82f6' },
                    { v: (stats.totalArea / 10000).toFixed(2), l: 'Area (ha)', c: '#6366f1' },
                    { v: stats.vacantCount, l: 'Vacant', c: '#d97706' },
                    { v: stats.totalParcels - stats.vacantCount, l: 'Developed', c: '#059669' },
                  ].map(({ v, l, c }) => (
                    <div key={l} style={{ ...styles.kpiCard, background: `${c}0d` }}>
                      <div style={{ ...styles.kpiVal, color: c }}>{v}</div>
                      <div style={styles.kpiLbl}>{l}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section
                title="Land Use Breakdown"
                icon={<MapPin size={16} color="#10b981" />}
                expanded={expandedSections.landUse}
                onToggle={() => toggleSection('landUse')}
              >
                <div style={styles.catTable}>
                  <div style={styles.catHeader}>
                    <span>Category</span><span>Count</span><span>Share</span><span>Distribution</span>
                  </div>
                  {Object.entries(stats.categories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const pct = ((count / stats.totalParcels) * 100).toFixed(1);
                      const color = CAT_COLORS[cat] || '#94a3b8';
                      return (
                        <div key={cat} style={styles.catRow}>
                          <div style={styles.catName}>
                            <span style={{ ...styles.catDot, background: color }} />{cat}
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{pct}%</span>
                          <div style={styles.barTrack}>
                            <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Section>

              <Section
                title="Capacity Estimates"
                icon={<Users size={16} color="#a855f7" />}
                expanded={expandedSections.capacity}
                onToggle={() => toggleSection('capacity')}
              >
                <div style={styles.capGrid}>
                  <div style={styles.capCard}>
                    <div style={styles.capEmoji}>🕌</div>
                    <div style={{ ...styles.capValue, color: '#3b82f6' }}>
                      {Math.floor(
                        selectionData.parcels.filter(p => p.LANDUSE_CATEGORY === 'Religious')
                          .reduce((s, p) => s + (Number(p.AREA_M2) || 0), 0) / 8
                      ).toLocaleString()}
                    </div>
                    <div style={styles.capLabel}>Mosque Capacity</div>
                  </div>
                  <div style={styles.capCard}>
                    <div style={styles.capEmoji}>🏪</div>
                    <div style={{ ...styles.capValue, color: '#d97706' }}>
                      {Math.floor(
                        selectionData.parcels.filter(p => p.LANDUSE_CATEGORY === 'Commercial')
                          .reduce((s, p) => s + (Number(p.AREA_M2) || 0), 0) / 120
                      ).toLocaleString()}
                    </div>
                    <div style={styles.capLabel}>Estimated Shops</div>
                  </div>
                </div>
              </Section>

              <Section
                title="AI Analysis & Insights"
                icon={<TrendingUp size={16} color="#059669" />}
                expanded={expandedSections.insights}
                onToggle={() => toggleSection('insights')}
              >
                {reportData?.report ? (
                  <div style={styles.reportText}>{reportData.report}</div>
                ) : (
                  <div style={styles.noReport}>No AI insights available for this selection.</div>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, expanded, onToggle, children }) {
  return (
    <div style={secStyles.wrap}>
      <button style={secStyles.header} onClick={onToggle}>
        <div style={secStyles.titleRow}>
          {icon}
          <span style={secStyles.title}>{title}</span>
        </div>
        {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />}
      </button>
      {expanded && <div style={secStyles.body}>{children}</div>}
    </div>
  );
}

const secStyles = {
  wrap: {
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.07)',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    background: 'rgba(248,250,252,0.8)',
    border: 'none',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  body: {
    padding: '16px 18px',
  },
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.50)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    width: '92vw',
    maxWidth: 860,
    height: '90vh',
    maxHeight: 820,
    background: '#f8fafc',
    borderRadius: 24,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)',
    animation: 'fadeInScale 0.25s ease',
    border: '1px solid rgba(255,255,255,0.8)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    background: 'white',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
  },
  title: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 16px',
    borderRadius: 999,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 2px 8px rgba(59,130,246,0.40)',
    transition: 'all var(--transition-fast)',
  },
  btnDisabled: {
    background: 'rgba(0,0,0,0.08)',
    color: 'var(--text-tertiary)',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.06)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    border: 'none',
    transition: 'all var(--transition-fast)',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  centerState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 14,
    padding: 40,
  },
  spinnerRing: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(59,130,246,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  stateHint: {
    fontSize: '0.82rem',
    color: 'var(--text-tertiary)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
  },
  kpiCard: {
    borderRadius: 12,
    padding: '12px 14px',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  kpiVal: {
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  kpiLbl: {
    fontSize: '0.68rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: 4,
    fontWeight: 600,
  },
  catTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  catHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 60px 60px 120px',
    padding: '6px 10px',
    fontSize: '0.67rem',
    fontWeight: 700,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  catRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 60px 60px 120px',
    padding: '10px 10px',
    background: 'rgba(248,250,252,0.8)',
    borderRadius: 8,
    alignItems: 'center',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  catName: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  barTrack: {
    height: 6,
    background: 'rgba(0,0,0,0.06)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    transition: 'width var(--transition-normal)',
  },
  capGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 14,
  },
  capCard: {
    padding: '20px',
    background: 'rgba(248,250,252,0.9)',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
    textAlign: 'center',
  },
  capEmoji: {
    fontSize: '2.2rem',
    lineHeight: 1,
  },
  capValue: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  capLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  reportText: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.75,
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    background: 'rgba(248,250,252,0.6)',
    padding: '16px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.05)',
  },
  noReport: {
    textAlign: 'center',
    padding: '32px',
    color: 'var(--text-tertiary)',
    fontSize: '0.88rem',
  },
};
