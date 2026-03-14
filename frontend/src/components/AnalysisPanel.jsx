import { useState } from "react";
import { getParcelStats, analyzeParcels } from "../api/client";

export default function AnalysisPanel({ onAnalysis }) {
  const [stats, setStats] = useState(null);
  const [provider, setProvider] = useState("ollama");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setError(null);
    try {
      setStats(await getParcelStats());
    } catch (err) {
      setError(err.message);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeParcels(provider);
      onAnalysis?.(result.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="analysis-panel">
      <h2>Analysis</h2>
      <button onClick={loadStats}>Load Parcel Stats</button>
      {stats && (
        <table className="stats-table">
          <tbody>
            {Object.entries(stats).map(([k, v]) =>
              k !== "land_use_breakdown" ? (
                <tr key={k}>
                  <td>{k.replace(/_/g, " ")}</td>
                  <td>{typeof v === "number" ? v.toFixed(4) : String(v)}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      )}
      <div className="provider-select">
        <label htmlFor="llm-provider">LLM Provider: </label>
        <select
          id="llm-provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="ollama">Ollama (local)</option>
          <option value="gemini">Gemini</option>
          <option value="groq">Groq</option>
        </select>
      </div>
      <button onClick={runAnalysis} disabled={loading}>
        {loading ? "Analyzing…" : "Run AI Analysis"}
      </button>
      {error && <div className="error">{error}</div>}
    </section>
  );
}
