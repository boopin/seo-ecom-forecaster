// src/components/WhatIfAnalysis.tsx

import React, { useState } from 'react';
import { getCTR, getSeasonalityMultiplier } from '../utils/utils';

interface Keyword {
  keyword: string;
  searchVolume: number;
  position: number;
  targetPosition: number;
  difficulty: number;
}

interface Settings {
  category: string;
  projectionPeriod: number;
  currency: string;
  conversionRate: number;
  investment: number;
  averageOrderValue: number;
  ctrModel: string;
}

interface WhatIfAnalysisProps {
  keywords: Keyword[];
  settings: Settings;
  customCTR: Record<number, number>;
}

const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({ keywords, settings, customCTR }) => {
  const [variable, setVariable] = useState<'conversionRate' | 'averageOrderValue'>('conversionRate');
  const [rangeStart, setRangeStart] = useState<number>(settings.conversionRate - 1);
  const [rangeEnd, setRangeEnd] = useState<number>(settings.conversionRate + 1);
  const [results, setResults] = useState<Array<{ value: number; traffic: number; conversions: number; revenue: number }>>([]);

  const calculateWhatIf = () => {
    const results: Array<{ value: number; traffic: number; conversions: number; revenue: number }> = [];
    const step = (rangeEnd - rangeStart) / 4; // 5 data points
    const ctrModel = settings.ctrModel === 'Custom' ? customCTR : getCTRModel(settings.ctrModel);

    for (let value = rangeStart; value <= rangeEnd; value += step) {
      let totalTraffic = 0, totalConversions = 0, totalRevenue = 0;

      for (let month = 1; month <= settings.projectionPeriod; month++) {
        let monthlyTraffic = 0, monthlyConversions = 0, monthlyRevenue = 0;

        keywords.forEach(keyword => {
          const positionDelta = (keyword.position - keyword.targetPosition) / settings.projectionPeriod;
          const difficultyFactor = 1 - (keyword.difficulty / 100); // Higher difficulty slows improvement
          const adjustedDelta = positionDelta * difficultyFactor;
          const currentMonthPosition = Math.max(keyword.targetPosition, keyword.position - adjustedDelta * (month - 1));
          const ctr = getCTR(currentMonthPosition, ctrModel);
          const seasonality = getSeasonalityMultiplier(month, settings.category);
          const traffic = keyword.searchVolume * ctr * seasonality;
          const conversions = traffic * (variable === 'conversionRate' ? value / 100 : settings.conversionRate / 100);
          const revenue = conversions * (variable === 'averageOrderValue' ? value : settings.averageOrderValue);

          monthlyTraffic += traffic;
          monthlyConversions += conversions;
          monthlyRevenue += revenue;
        });

        totalTraffic += monthlyTraffic;
        totalConversions += monthlyConversions;
        totalRevenue += monthlyRevenue;
      }

      results.push({
        value: parseFloat(value.toFixed(2)),
        traffic: Math.round(totalTraffic),
        conversions: Math.round(totalConversions),
        revenue: parseFloat(totalRevenue.toFixed(2))
      });
    }

    setResults(results);
  };

  const getCTRModel = (modelName: string): Record<number, number> => {
    const models: Record<string, Record<number, number>> = {
      "Default": { 1: 0.317, 2: 0.247, 3: 0.187, 4: 0.133, 5: 0.095, 6: 0.068, 7: 0.049, 8: 0.035, 9: 0.025, 10: 0.018 },
      "E-commerce": { 1: 0.25, 2: 0.20, 3: 0.15, 4: 0.10, 5: 0.08, 6: 0.06, 7: 0.04, 8: 0.03, 9: 0.02, 10: 0.015 },
      "Informational": { 1: 0.40, 2: 0.30, 3: 0.22, 4: 0.15, 5: 0.10, 6: 0.07, 7: 0.05, 8: 0.04, 9: 0.03, 10: 0.02 }
    };
    return models[modelName] || models["Default"];
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">What-If Analysis</h2>
      <div className="bg-gray-50 p-4 rounded">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Variable to Analyze</label>
            <select className="w-full border p-2 rounded" value={variable} onChange={(e) => setVariable(e.target.value as 'conversionRate' | 'averageOrderValue')}>
              <option value="conversionRate">Conversion Rate (%)</option>
              <option value="averageOrderValue">Average Order Value</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Range Start</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={rangeStart}
              onChange={(e) => setRangeStart(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Range End</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <button onClick={calculateWhatIf} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Analyze</button>
          </div>
        </div>
        {results.length > 0 && (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">{variable === 'conversionRate' ? 'Conversion Rate (%)' : 'Average Order Value'}</th>
                <th className="p-2 border text-right">Total Traffic</th>
                <th className="p-2 border text-right">Total Conversions</th>
                <th className="p-2 border text-right">Total Revenue ({settings.currency.split(' ')[1]})</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td className="p-2 border">{result.value}</td>
                  <td className="p-2 border text-right">{result.traffic}</td>
                  <td className="p-2 border text-right">{result.conversions}</td>
                  <td className="p-2 border text-right">{result.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
