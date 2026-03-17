import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Parcels & Data Endpoints
// ============================================================================

export const getParcelsLightweight = async () => {
  const response = await apiClient.get('/parcels/lightweight');
  return response.data;
};

export const getParcelDetail = async (objectId) => {
  const response = await apiClient.get(`/parcels/${objectId}`);
  return response.data;
};

export const getBlocks = async () => {
  const response = await apiClient.get('/blocks');
  return response.data;
};

export const getBlockAnalysis = async (blockId) => {
  const response = await apiClient.get(`/analysis/block/${blockId}`);
  return response.data;
};

// ============================================================================
// Selection Endpoints
// ============================================================================

export const selectPolygon = async (coordinates) => {
  const response = await apiClient.post('/selection/polygon', { coordinates });
  return response.data;
};

export const selectBBox = async (minLat, maxLat, minLon, maxLon) => {
  const response = await apiClient.post('/selection/bbox', {
    min_lat: minLat,
    max_lat: maxLat,
    min_lon: minLon,
    max_lon: maxLon,
  });
  return response.data;
};

// ============================================================================
// Query Endpoints
// ============================================================================

export const queryCategory = async (category, selectedObjectIds) => {
  const response = await apiClient.post('/query/category', {
    category,
    selected_objectids: selectedObjectIds,
  });
  return response.data;
};

export const queryNaturalLanguage = async (question, selectionSummary) => {
  const response = await apiClient.post('/query/nl', {
    question,
    selection_summary: selectionSummary,
  });
  return response.data;
};

// ============================================================================
// Capacity Calculation Endpoints
// ============================================================================

export const calculateMosqueCapacity = async (objectId) => {
  const response = await apiClient.post('/calculate/mosque', { object_id: objectId });
  return response.data;
};

export const calculateCommercialCapacity = async (objectId, shopSizeM2) => {
  const response = await apiClient.post('/calculate/commercial', {
    object_id: objectId,
    shop_size_m2: shopSizeM2,
  });
  return response.data;
};

// ============================================================================
// Report Endpoints
// ============================================================================

export const generateTextReport = async (selectionSummary, extraContext = '') => {
  const response = await apiClient.post('/report/text', {
    selection_summary: selectionSummary,
    extra_context: extraContext,
  });
  return response.data;
};

export const generatePdfReport = async (selectionSummary, extraContext = '') => {
  const response = await apiClient.post('/report/pdf', {
    selection_summary: selectionSummary,
    extra_context: extraContext,
  }, { responseType: 'blob' });
  return response.data;
};

export const exportShapefile = async (selectedObjectIds) => {
  const response = await apiClient.post('/export/shapefile', {
    selected_objectids: selectedObjectIds,
  }, { responseType: 'blob' });
  return response.data;
};

// ============================================================================
// Legacy Endpoints (backward compatibility)
// ============================================================================

export const analyzeBBox = async (bbox) => {
  const response = await apiClient.post('/analyze/bbox', bbox);
  return response.data;
};

export const analyzePolygon = async (polygonData) => {
  const response = await apiClient.post('/analyze/polygon', polygonData);
  return response.data;
};

export default apiClient;
