import { useState } from "react";
import AnalysisPanel from "./components/AnalysisPanel";
import MapView from "./components/MapView";
import ReportViewer from "./components/ReportViewer";

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  return (
    <>
      <header className="app-header">
        <h1>GIS Land Analysis</h1>
      </header>
      <div className="content-grid">
        <MapView onBoundsChange={setMapBounds} />
        <div className="side-panel">
          <AnalysisPanel onAnalysis={setAnalysis} mapBounds={mapBounds} />
          <ReportViewer analysis={analysis} />
        </div>
      </div>
    </>
  );
}
