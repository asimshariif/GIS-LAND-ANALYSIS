import { getReportUrl } from "../api/client";

export default function ReportViewer({ analysis }) {
  return (
    <section className="report-viewer">
      <h2>Report</h2>
      {analysis && (
        <div className="analysis-text">
          <h3>AI Insights</h3>
          {analysis.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
      <a
        href={getReportUrl()}
        target="_blank"
        rel="noreferrer"
        className="download-btn"
      >
        Download PDF Report
      </a>
    </section>
  );
}
