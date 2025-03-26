// src/components/ProjectionsTable.tsx

import React, { useState } from 'react';

interface Projection {
  month: string;
  traffic: number;
  conversions: number;
  revenue: string;
  roi: string;
  trafficRange: [number, number];
  conversionsRange: [number, number];
  revenueRange: [number, number];
  keywordBreakdown: Array<{
    keyword: string;
    traffic: number;
    conversions: number;
    revenue: number;
  }>;
}

interface ProjectionsTableProps {
  projections: Projection[];
  settings: {
    currency: string;
    investment: number;
  };
}

const ProjectionsTable: React.FC<ProjectionsTableProps> = ({ projections, settings }) => {
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);

  // Calculate break-even point
  const breakEvenMonth = projections.find(proj => parseFloat(proj.revenue) >= settings.investment)?.month || 'N/A';

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Monthly Projections</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border text-left">Month</th>
            <th className="p-2 border text-right">Traffic (±10%)</th>
            <th className="p-2 border text-right">Conversions (±10%)</th>
            <th className="p-2 border text-right">Revenue ({settings.currency.split(' ')[1]}) (±10%)</th>
            <th className="p-2 border text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          {projections.map((proj, index) => (
            <React.Fragment key={index}>
              <tr className="cursor-pointer" onClick={() => setShowBreakdown(show === showBreakdown ? null : proj.month)}>
                <td className="p-2 border">{proj.month}</td>
                <td className="p-2 border text-right">{proj.traffic} ({proj.trafficRange[0]} - {proj.trafficRange[1]})</td>
                <td className="p-2 border text-right">{proj.conversions} ({proj.conversionsRange[0]} - {proj.conversionsRange[1]})</td>
                <td className="p-2 border text-right">{proj.revenue} ({proj.revenueRange[0]} - {proj.revenueRange[1]})</td>
                <td className="p-2 border text-right">{proj.roi}%</td>
              </tr>
              {showBreakdown === proj.month && (
                <tr>
                  <td colSpan={5} className="p-2 border">
                    <h3 className="font-medium mb-2">Keyword Breakdown for {proj.month}</h3>
                    <table className="w-full border">
                      <thead>
                        <tr>
                          <th className="p-2 border text-left">Keyword</th>
                          <th className="p-2 border text-right">Traffic</th>
                          <th className="p-2 border text-right">Conversions</th>
                          <th className="p-2 border text-right">Revenue ({settings.currency.split(' ')[1]})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proj.keywordBreakdown.map((breakdown, idx) => (
                          <tr key={idx}>
                            <td className="p-2 border">{breakdown.keyword}</td>
                            <td className="p-2 border text-right">{Math.round(breakdown.traffic)}</td>
                            <td className="p-2 border text-right">{Math.round(breakdown.conversions)}</td>
                            <td className="p-2 border text-right">{breakdown.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="mt-4 p-2 bg-green-50 rounded text-green-700">
        <strong>Break-Even Analysis:</strong> You will recover your {settings.currency.split(' ')[1]}{settings.investment} investment by {breakEvenMonth}.
      </div>
    </div>
  );
};

export default ProjectionsTable;
