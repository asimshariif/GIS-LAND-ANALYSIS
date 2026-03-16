import React from 'react';
import { Map, FileText, Loader2 } from 'lucide-react';

export default function TopBar({ selectionSummary, onGenerateReport, isGeneratingReport }) {
  const parcelCount = selectionSummary?.total_parcels || 0;

  return (
    <header style={styles.container}>
      {/* Logo & Title */}
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>
          <Map size={24} />
        </div>
        <h1 style={styles.title}>Land Analysis Platform</h1>
      </div>

      {/* Selection Badge */}
      <div style={styles.badgeSection}>
        <div style={{
          ...styles.badge,
          ...(parcelCount > 0 ? styles.badgeActive : {})
        }}>
          {parcelCount > 0 ? (
            <>
              <span style={styles.badgeCount}>{parcelCount.toLocaleString()}</span>
              <span style={styles.badgeText}>parcels selected</span>
            </>
          ) : (
            <span style={styles.badgeEmpty}>No Selection</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actionsSection}>
        <button
          style={{
            ...styles.reportButton,
            ...(parcelCount === 0 || isGeneratingReport ? styles.reportButtonDisabled : {})
          }}
          onClick={onGenerateReport}
          disabled={parcelCount === 0 || isGeneratingReport}
        >
          {isGeneratingReport ? (
            <>
              <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FileText size={18} />
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 'var(--topbar-height)',
    background: 'var(--panel-surface)',
    borderBottom: '1px solid var(--panel-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 1000,
    boxShadow: 'var(--shadow-md)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'var(--accent-blue)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  badgeSection: {
    display: 'flex',
    justifyContent: 'center',
    flex: 1,
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '20px',
    background: 'var(--bg-deep-navy)',
    border: '1px solid var(--panel-border)',
    fontSize: '0.85rem',
  },
  badgeActive: {
    borderColor: 'var(--accent-blue)',
    background: 'rgba(59, 130, 246, 0.1)',
  },
  badgeCount: {
    fontWeight: 700,
    color: 'var(--accent-blue)',
    fontSize: '0.95rem',
  },
  badgeText: {
    color: 'var(--text-secondary)',
  },
  badgeEmpty: {
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
  },
  actionsSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    flex: 1,
  },
  reportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'var(--accent-blue)',
    color: 'white',
    fontWeight: 500,
    fontSize: '0.875rem',
    transition: 'all var(--transition-fast)',
  },
  reportButtonDisabled: {
    background: 'var(--panel-border)',
    color: 'var(--text-secondary)',
    cursor: 'not-allowed',
  },
};
