// src/UpdatedSEOTool.tsx

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import SettingsForm from './components/SettingsForm';
import KeywordsTable from './components/KeywordsTable';
import ProjectionsTable from './components/ProjectionsTable';
import WhatIfAnalysis from './components/WhatIfAnalysis';
import { getCTR, getSeasonalityMultiplier, CTR_MODELS } from './utils/utils';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

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

const UpdatedSEOTool: React.FC = () => {
  const [hasUploaded, setHasUploaded] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<Keyword[]>([
    { keyword: "gas bbq", searchVolume: 8000, position: 8, targetPosition: 3, difficulty: 50 },
    { keyword: "charcoal bbq/orange bbq", searchVolume: 6500, position: 12, targetPosition: 5, difficulty: 60 },
    { keyword: "bbq grill", searchVolume: 5000, position: 9, targetPosition: 4, difficulty: 55 }
  ]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [newVolume, setNewVolume] = useState<string>("");
  const [newPosition, setNewPosition] = useState<string>("");
  const [newTarget, setNewTarget] = useState<string>("");
  const [newDifficulty, setNewDifficulty] = useState<string>("");
  const [showNewKeywordForm, setShowNewKeywordForm] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('seoSettings');
    return saved ? JSON.parse(saved) : {
      category: "BBQ & Outdoor Cooking",
      projectionPeriod: 6,
      currency: "GBP (£)",
      conversionRate: 3.0,
      investment: 5000,
      averageOrderValue: 250,
      ctrModel: "Default"
    };
  });
  const [customCTR, setCustomCTR] = useState<Record<number, number>>({});
  const [projections, setProjections] = useState<Projection[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('seoSettings', JSON.stringify(settings));
  }, [settings]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    setFileError("");

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result: Papa.ParseResult<Keyword>) => {
          const parsed = result.data.map(row => ({
            keyword: row.keyword || "",
            searchVolume: parseInt(row.searchVolume as unknown as string) || 0,
            position: parseInt(row.position as unknown as string) || 20,
            targetPosition: parseInt(row.targetPosition as unknown as string) || 10,
            difficulty: parseInt(row.difficulty as unknown as string) || 50
          }));
          if (parsed.every(row => row.keyword && row.searchVolume > 0)) {
            setKeywords(parsed);
            setHasUploaded(true);
          } else {
            setFileError("CSV must contain valid 'keyword' and 'searchVolume' columns with positive values.");
          }
        },
        error: () => setFileError("Error parsing CSV file. Please check the format.")
      });
    } else if (fileExtension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const headers = jsonData[0].map((h: string) => h.toLowerCase().trim());
          const parsed = jsonData.slice(1).map((row: any[]) => {
            const rowObj: Record<string, any> = {};
            headers.forEach((header: string, idx: number) => {
              rowObj[header] = row[idx];
            });
            return {
              keyword: rowObj.keyword || "",
              searchVolume: parseInt(rowObj.searchvolume) || 0,
              position: parseInt(rowObj.position) || 20,
              targetPosition: parseInt(rowObj.targetposition) || 10,
              difficulty: parseInt(rowObj.difficulty) || 50
            };
          });

          if (parsed.every((row: Keyword) => row.keyword && row.searchVolume > 0)) {
            setKeywords(parsed);
            setHasUploaded(true);
          } else {
            setFileError("Excel file must contain valid 'keyword' and 'searchVolume' columns with positive values.");
          }
        } catch (error) {
          setFileError("Error parsing Excel file. Please check the format.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setFileError("Unsupported file format. Please upload a .csv or .xlsx file.");
    }
  };

  const downloadSampleCSV = () => {
    const sample = "keyword,searchVolume,position,targetPosition,difficulty\n" +
                  "gas bbq,8000,8,3,50\n" +
                  "charcoal bbq,6500,12,5,60\n" +
                  "bbq grill,5000,9,4,55\n";
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_keywords.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefaults = () => {
    setSettings({
      category: "BBQ & Outdoor Cooking",
      projectionPeriod: 6,
      currency: "GBP (£)",
      conversionRate: 3.0,
      investment: 5000,
      averageOrderValue: 250,
      ctrModel: "Default"
    });
    setKeywords([
      { keyword: "gas bbq", searchVolume: 8000, position: 8, targetPosition: 3, difficulty: 50 },
      { keyword: "charcoal bbq/orange bbq", searchVolume: 6500, position: 12, targetPosition: 5, difficulty: 60 },
      { keyword: "bbq grill", searchVolume: 5000, position: 9, targetPosition: 4, difficulty: 55 }
    ]);
    setCustomCTR({});
    setProjections([]);
    localStorage.removeItem('seoSettings');
  };

  const calculateForecast = () => {
    try {
      setLoading(true);
      const { conversionRate, projectionPeriod, averageOrderValue, investment } = settings;
      if (!projectionPeriod || projectionPeriod < 1 || projectionPeriod > 12) {
        setValidationError("Projection period must be between 1 and 12 months.");
        setLoading(false);
        return;
      }

      const ctrModel = settings.ctrModel === 'Custom' ? customCTR : CTR_MODELS[settings.ctrModel];
      const projections: Projection[] = [];
      let totalTraffic = 0, totalConversions = 0, totalRevenue = 0;

      for (let month = 1; month <= projectionPeriod; month++) {
        let monthlyTraffic = 0, monthlyConversions = 0, monthlyRevenue = 0;
        const keywordBreakdown: Array<{ keyword: string; traffic: number; conversions: number; revenue: number }> = [];

        keywords.forEach(keyword => {
          const { searchVolume, position, targetPosition, difficulty } = keyword;
          if (!searchVolume || !position || !targetPosition) {
            throw new Error(`Invalid keyword data: ${JSON.stringify(keyword)}`);
          }

          const positionDelta = (position - targetPosition) / projectionPeriod;
          const difficultyFactor = 1 - (difficulty / 100); // Higher difficulty slows improvement
          const adjustedDelta = positionDelta * difficultyFactor;
          const currentMonthPosition = Math.max(targetPosition, position - adjustedDelta * (month - 1));
          const ctr = getCTR(currentMonthPosition, ctrModel);
          const seasonality = getSeasonalityMultiplier(month, settings.category);
          const traffic = searchVolume * ctr * seasonality;
          const conversions = traffic * (conversionRate / 100);
          const revenue = conversions * averageOrderValue;

          monthlyTraffic += traffic;
          monthlyConversions += conversions;
          monthlyRevenue += revenue;

          keywordBreakdown.push({
            keyword: keyword.keyword,
            traffic,
            conversions,
            revenue
          });
        });

        totalTraffic += monthlyTraffic;
        totalConversions += monthlyConversions;
        totalRevenue += monthlyRevenue;

        // Add confidence intervals (±10%)
        const trafficRange: [number, number] = [Math.round(monthlyTraffic * 0.9), Math.round(monthlyTraffic * 1.1)];
        const conversionsRange: [number, number] = [Math.round(monthlyConversions * 0.9), Math.round(monthlyConversions * 1.1)];
        const revenueRange: [number, number] = [parseFloat((monthlyRevenue * 0.9).toFixed(2)), parseFloat((monthlyRevenue * 1.1).toFixed(2))];

        projections.push({
          month: new Date(2025, month - 1).toLocaleString('default', { month: 'short' }),
          traffic: Math.round(monthlyTraffic),
          conversions: Math.round(monthlyConversions),
          revenue: monthlyRevenue.toFixed(2),
          roi: (((totalRevenue - investment) / investment) * 100).toFixed(1),
          trafficRange,
          conversionsRange,
          revenueRange,
          keywordBreakdown
        });
      }

      setProjections(projections);
      setValidationError("");
    } catch (error) {
      console.error("Error in calculateForecast:", error);
      setValidationError("An error occurred while calculating the forecast. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadProjectionsCSV = () => {
    const headers = "Month,Traffic,Conversions,Revenue,ROI\n";
    const rows = projections.map(p => `${p.month},${p.traffic},${p.conversions},${p.revenue},${p.roi}`).join('\n');
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo_projections.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printForecast = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>SEO Forecast</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
              th { background-color: #f2f2f2; text-align: left; }
              h2 { text-align: center; }
              .break-even { background-color: #e6ffe6; padding: 10px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h2>SEO Forecast</h2>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Traffic (±10%)</th>
                  <th>Conversions (±10%)</th>
                  <th>Revenue (${settings.currency.split(' ')[1]}) (±10%)</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                ${projections.map(proj => `
                  <tr>
                    <td>${proj.month}</td>
                    <td>${proj.traffic} (${proj.trafficRange[0]} - ${proj.trafficRange[1]})</td>
                    <td>${proj.conversions} (${proj.conversionsRange[0]} - ${proj.conversionsRange[1]})</td>
                    <td>${proj.revenue} (${proj.revenueRange[0]} - ${proj.revenueRange[1]})</td>
                    <td>${proj.roi}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="break-even">
              <strong>Break-Even Analysis:</strong> You will recover your ${settings.currency.split(' ')[1]}${settings.investment} investment by ${projections.find(proj => parseFloat(proj.revenue) >= settings.investment)?.month || 'N/A'}.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const chartData = {
    labels: projections.map(p => p.month),
    datasets: [
      { label: 'Traffic', data: projections.map(p => p.traffic), borderColor: 'rgba(75, 192, 192, 1)', fill: false },
      { label: `Revenue (${settings.currency.split(' ')[1]})`, data: projections.map(p => p.revenue), borderColor: 'rgba(255, 99, 132, 1)', fill: false }
    ]
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">SEO Forecasting Tool</h1>
      <p className="mb-4">Upload keywords (CSV or Excel) or manually enter them to forecast SEO impact.</p>

      {/* File Upload */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upload Keywords</h2>
        <div className="border-dashed border-2 border-gray-300 p-6 rounded-lg">
          <div className="text-center mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-1 text-sm text-gray-600">
              {hasUploaded ? "File uploaded successfully!" : "Upload a CSV or Excel file with your keywords data"}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              <span>{hasUploaded ? "Change File" : "Select File"}</span>
              <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleUpload} />
            </label>
            <button onClick={downloadSampleCSV} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Download Sample CSV
            </button>
          </div>
          {fileError && <div className="mt-4 p-2 bg-red-50 rounded text-center text-red-700">{fileError}</div>}
          {hasUploaded && !fileError && (
            <div className="mt-4 p-2 bg-green-50 rounded text-center text-green-700">Keywords imported successfully!</div>
          )}
        </div>
        <div className="mt-4 bg-blue-50 p-4 rounded">
          <h3 className="font-medium mb-2">Supported Formats:</h3>
          <p>CSV (.csv) or Excel (.xlsx) with columns:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>keyword (required)</li>
            <li>searchVolume (required, positive number)</li>
            <li>position (optional, 1-100)</li>
            <li>targetPosition (optional, 1-100)</li>
            <li>difficulty (optional, 1-100)</li>
          </ul>
          <p className="mt-1 text-sm">Example: "gas bbq",8000,8,3,50</p>
        </div>
      </div>

      {/* Settings */}
      <SettingsForm settings={settings} setSettings={setSettings} />

      {/* Custom CTR Table */}
      {settings.ctrModel === 'Custom' && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Custom CTR Table</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(pos => (
              <div key={pos}>
                <label className="block text-sm mb-1">Position {pos} (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full border p-2 rounded"
                  value={customCTR[pos] || 0}
                  onChange={(e) => setCustomCTR({ ...customCTR, [pos]: parseFloat(e.target.value) / 100 || 0 })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      <KeywordsTable
        keywords={keywords}
        setKeywords={setKeywords}
        showNewKeywordForm={showNewKeywordForm}
        setShowNewKeywordForm={setShowNewKeywordForm}
        newKeyword={newKeyword}
        setNewKeyword={setNewKeyword}
        newVolume={newVolume}
        setNewVolume={setNewVolume}
        newPosition={newPosition}
        setNewPosition={setNewPosition}
        newTarget={newTarget}
        setNewTarget={setNewTarget}
        newDifficulty={newDifficulty}
        setNewDifficulty={setNewDifficulty}
        validationError={validationError}
        setValidationError={setValidationError}
      />

      {/* Calculate Forecast and Reset */}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={calculateForecast}
          className="bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Forecast"}
        </button>
        <button
          onClick={resetToDefaults}
          className="bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Projections */}
      {projections.length > 0 && (
        <>
          <ProjectionsTable projections={projections} settings={settings} />

          {/* Visualization */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Traffic & Revenue Trends</h2>
            <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </div>

          {/* What-If Analysis */}
          <WhatIfAnalysis keywords={keywords} settings={settings} customCTR={customCTR} />
        </>
      )}

      {/* Export and Print Buttons */}
      <div className="flex justify-end mt-4 space-x-4">
        <button className="bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700" onClick={downloadProjectionsCSV}>
          Export Results
        </button>
        {projections.length > 0 && (
          <button className="bg-purple-600 text-white py-2 px-4 rounded font-medium hover:bg-purple-700" onClick={printForecast}>
            Print Forecast
          </button>
        )}
        <button className="bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700" onClick={downloadProjectionsCSV}>
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default UpdatedSEOTool;
