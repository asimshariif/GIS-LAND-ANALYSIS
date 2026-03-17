import React, { useState, useCallback } from 'react';
import MapView from './components/MapView';
import TopBar from './components/TopBar';
import LeftToolbar from './components/LeftToolbar';
import BottomPanel from './components/BottomPanel';
import ParcelDetailDrawer from './components/ParcelDetailDrawer';
import ReportViewer from './components/ReportViewer';
import QueryBar from './components/QueryBar';
import { queryCategory, generateTextReport, getParcelDetail } from './api/client';
import './index.css';

export default function App() {
  // Selection state
  const [selectionSummary, setSelectionSummary] = useState(null);
  const [selectionData, setSelectionData] = useState(null); // Full parcel data
  const [selectedObjectIds, setSelectedObjectIds] = useState([]);
  
  // Query state
  const [highlightedObjectIds, setHighlightedObjectIds] = useState([]);
  const [queriedParcels, setQueriedParcels] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  
  // UI state
  const [drawMode, setDrawMode] = useState(null); // 'polygon' | 'rectangle' | null
  const [queryMode, setQueryMode] = useState(false);
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'analysis'
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('query'); // 'query' | 'detail' | 'calculator'
  const [selectedParcel, setSelectedParcel] = useState(null);
  
  // Report modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Map zoom target [lat, lng]
  const [zoomTarget, setZoomTarget] = useState(null);

  // Handle selection complete from MapView
  const handleSelectionComplete = useCallback((summary, objectIds, parcels) => {
    setSelectionSummary(summary);
    setSelectedObjectIds(objectIds);
    setSelectionData({ parcels });
    setIsBottomPanelExpanded(true);
    // Reset query state when new selection is made
    setHighlightedObjectIds([]);
    setQueriedParcels([]);
    setActiveCategory(null);
    setIsDrawerOpen(false);
  }, []);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectionSummary(null);
    setSelectionData(null);
    setSelectedObjectIds([]);
    setHighlightedObjectIds([]);
    setQueriedParcels([]);
    setActiveCategory(null);
    setIsBottomPanelExpanded(false);
    setIsDrawerOpen(false);
    setDrawMode(null);
  }, []);

  // Handle category query from QueryBar or BottomPanel
  const handleCategorySelect = useCallback(async (category) => {
    if (activeCategory === category) {
      // Deselect if same category clicked
      setActiveCategory(null);
      setHighlightedObjectIds([]);
      setQueriedParcels([]);
      setIsDrawerOpen(false);
      return;
    }

    try {
      const result = await queryCategory(category, selectedObjectIds);
      const objectIds = result.parcels.map(p => p.OBJECTID);
      
      setActiveCategory(category);
      setHighlightedObjectIds(objectIds);
      setQueriedParcels(result.parcels);
      setDrawerMode('query');
      setIsDrawerOpen(true);
    } catch (e) {
      console.error('Failed to query category:', e);
    }
  }, [activeCategory, selectedObjectIds]);

  // Handle parcel click from map
  const handleParcelClick = useCallback(async (objectId) => {
    try {
      const result = await getParcelDetail(objectId);
      setSelectedParcel(result.parcel);
      setDrawerMode('detail');
      setIsDrawerOpen(true);
    } catch (e) {
      console.error('Failed to get parcel detail:', e);
    }
  }, []);

  // Handle parcel selection from drawer list
  const handleParcelSelect = useCallback((parcel) => {
    setSelectedParcel(parcel);
    setDrawerMode('detail');
  }, []);

  // Handle highlight (hover/click) on parcel in drawer
  const handleHighlightParcel = useCallback((objectId) => {
    // Could trigger map zoom/highlight
    console.log('Highlight parcel:', objectId);
  }, []);

  // Handle back to query results from parcel detail
  const handleBackToQuery = useCallback(() => {
    setSelectedParcel(null);
    setDrawerMode('query');
  }, []);

  // Handle report generation
  const handleGenerateReport = useCallback(async () => {
    if (!selectionData?.parcels?.length) return;
    
    setIsReportOpen(true);
    setIsGeneratingReport(true);
    setReportData(null);
    setReportError(null);
    
    try {
      const result = await generateTextReport(selectionSummary);
      setReportData(result);
    } catch (e) {
      console.error('Failed to generate report:', e);
      setReportError(e.message || 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [selectionSummary, selectionData]);

  // Handle draw mode change
  const handleDrawModeChange = useCallback((mode) => {
    setDrawMode(prev => prev === mode ? null : mode);
  }, []);

  // Handle query mode toggle
  const handleQueryModeToggle = useCallback(() => {
    setQueryMode(prev => !prev);
  }, []);

  // Handle zoom to block from AnalysisPanel
  const handleZoomToBlock = useCallback((block) => {
    if (block.centroid && block.centroid.length === 2) {
      setZoomTarget([...block.centroid, Date.now()]); // append timestamp to force re-trigger
    }
  }, []);

  // Handle block report generation from AnalysisPanel
  const handleBlockReport = useCallback(async (block) => {
    if (!selectionData?.parcels?.length) return;

    // Filter parcels to only this block
    const blockParcels = selectionData.parcels.filter(p =>
      (p.BLOCK_NO || p.BLOCK_ID || 'Unknown') === String(block.block_id)
    );
    if (!blockParcels.length) return;

    // Build a mini summary for the block
    const categories = {};
    let totalArea = 0;
    blockParcels.forEach(p => {
      const cat = p.LANDUSE_CATEGORY || 'Unknown';
      categories[cat] = (categories[cat] || 0) + 1;
      totalArea += Number(p.AREA_M2) || 0;
    });
    const blockSummary = {
      total_parcels: blockParcels.length,
      total_area_m2: totalArea,
      category_breakdown: categories,
    };

    setIsReportOpen(true);
    setIsGeneratingReport(true);
    setReportData(null);
    setReportError(null);

    try {
      const result = await generateTextReport(blockSummary);
      setReportData(result);
    } catch (e) {
      console.error('Failed to generate block report:', e);
      setReportError(e.message || 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [selectionData]);

  return (
    <div className="app-container" style={styles.container}>
      {/* Full-screen Map */}
      <MapView
        drawMode={drawMode}
        onDrawModeComplete={() => setDrawMode(null)}
        onSelectionComplete={handleSelectionComplete}
        onClearSelection={handleClearSelection}
        highlightedObjectIds={highlightedObjectIds}
        onParcelClick={handleParcelClick}
        selectedObjectIds={selectedObjectIds}
        zoomTarget={zoomTarget}
      />

      {/* Top Bar */}
      <TopBar
        selectionSummary={selectionSummary}
        onGenerateReport={handleGenerateReport}
        isGeneratingReport={isGeneratingReport}
      />

      {/* Left Toolbar */}
      <LeftToolbar
        drawMode={drawMode}
        onDrawModeChange={handleDrawModeChange}
        onClearSelection={handleClearSelection}
        hasSelection={selectedObjectIds.length > 0}
        queryMode={queryMode}
        onQueryModeToggle={handleQueryModeToggle}
      />

      {/* Query Bar - only visible when selection exists */}
      {selectionSummary && (
        <QueryBar
          selectionSummary={selectionSummary}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          selectedObjectIds={selectedObjectIds}
          queriedParcels={queriedParcels}
        />
      )}

      {/* Bottom Panel - selection statistics with tabs */}
      {selectionSummary && (
        <BottomPanel
          isExpanded={isBottomPanelExpanded}
          onToggle={() => setIsBottomPanelExpanded(prev => !prev)}
          selectionSummary={selectionSummary}
          selectionData={selectionData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          onGenerateReport={handleGenerateReport}
          isGeneratingReport={isGeneratingReport}
          onZoomToBlock={handleZoomToBlock}
          onBlockReport={handleBlockReport}
        />
      )}

      {/* Right Drawer - parcel detail, query results, calculators */}
      <ParcelDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mode={drawerMode}
        queriedParcels={queriedParcels}
        activeCategory={activeCategory}
        selectedParcel={selectedParcel}
        onParcelSelect={handleParcelSelect}
        onHighlightParcel={handleHighlightParcel}
        onBackToQuery={handleBackToQuery}
      />

      {/* Report Modal */}
      <ReportViewer
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={reportData}
        selectionData={selectionData}
        isLoading={isGeneratingReport}
        error={reportError}
      />
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg-deep-navy)',
  },
};
