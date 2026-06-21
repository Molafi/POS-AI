import React from 'react';
import { api } from '../../../lib/api';

interface ExportReportProps {
  reportType: string;
  data: unknown[];
  title: string;
}

const ExportReport: React.FC<ExportReportProps> = ({ reportType, data, title }) => {
  const exportCSV = () => {
    if (!Array.isArray(data) || data.length === 0) return;

    const headers = Object.keys(data[0] as Record<string, unknown>);
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = (row as Record<string, unknown>)[h];
        return typeof val === 'number' ? val.toFixed(2) : `"${val}"`;
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3847/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, data, type: reportType }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCSV}
        className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-xs font-medium text-apex-text-secondary hover:text-apex-text-primary hover:border-apex-accent/50 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        CSV
      </button>
      <button
        onClick={exportPDF}
        className="px-3 py-1.5 bg-apex-elevated border border-apex-border rounded-lg text-xs font-medium text-apex-text-secondary hover:text-apex-text-primary hover:border-apex-accent/50 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        PDF
      </button>
    </div>
  );
};

export default ExportReport;
