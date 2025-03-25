import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // For CSV parsing
import * as XLSX from 'xlsx'; // For Excel parsing
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components, including CategoryScale
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

function UpdatedSEOTool() {
  const [hasUploaded, setHasUploaded] = useState(false);
  const [keywords, setKeywords] = useState([
    { keyword: "gas bbq", searchVolume: 8000, position: 8, targetPosition: 3 },
    { keyword: "charcoal bbq/orange bbq", searchVolume: 6500, position: 12, targetPosition: 5 },
    { keyword: "bbq grill", searchVolume: 5000, position: 9, targetPosition: 4 }
  ]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newVolume, setNewVolume] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [showNewKeywordForm, setShowNewKeywordForm] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('seoSettings');
    return saved ? JSON.parse(saved) : {
      category: "BBQ & Outdoor Cooking",
      projectionPeriod: 6,
      currency: "GBP (£)",
      conversionRate: 3.0,
      investment: 5000,
      averageOrderValue: 250
    };
  });
  const [projections, setProjections] = useState([]);
  const [fileError, setFileError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('seoSettings', JSON.stringify(settings));
  }, [settings]);

  // Handle file upload (CSV or Excel)
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    setFileError(""); // Reset error message

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsed = result.data.map(row => ({
            keyword: row.keyword || "",
            searchVolume: parseInt(row.searchVolume) || 0,
            position: parseInt(row.position) || 20,
            targetPosition: parseInt(row.targetPosition) || 10
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
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Assume first row is headers
          const headers = jsonData[0].map(h => h.toLowerCase().trim());
          const parsed = jsonData.slice(1).map(row => {
            const rowObj = {};
            headers.forEach((header, idx) => {
              rowObj[header] = row[idx];
            });
            return {
              keyword: rowObj.keyword || "",
              searchVolume: parseInt(rowObj.searchvolume) || 0,
              position: parseInt(rowObj.position) || 20,
              targetPosition: parseInt(rowObj.targetposition) || 10
            };
          });

          if (parsed.every(row => row.keyword && row.searchVolume > 0)) {
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

  // Download sample CSV
  const downloadSampleCSV = () => {
    const sample = "keyword,searchVolume,position,targetPosition\n" +
                  "gas bbq,8000,8,3\n" +
                  "charcoal bbq,6500,12,5\n" +
                  "bbq grill,5000,9,4\n";
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_keywords.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add a new keyword with validation
  const addKeyword = () => {
    const volume = parseInt(newVolume) || 0;
    const position = parseInt(newPosition) || 20;
    const targetPosition = parseInt(newTarget) || 10;

    if (!newKeyword.trim()) {
      setValidationError("Keyword cannot be empty.");
      return;
    }
    if (volume <= 0) {
      setValidationError("Search Volume must be positive.");
      return;
    }
    if (position < 1 || position > 100 || targetPosition < 1 || targetPosition > 100) {
      setValidationError("Positions must be between 1 and 100.");
      return;
    }

    setKeywords([...keywords, { keyword: newKeyword, searchVolume: volume, position, targetPosition }]);
    setValidationError("");
    resetNewKeywordForm();
  };

  const resetNewKeywordForm = () => {
    setNewKeyword("");
    setNewVolume("");
    setNewPosition("");
    setNewTarget("");
    setShowNewKeywordForm(false);
  };

  const updateKeyword = (index, field, value) => {
    const updatedKeywords = [...keywords];
    if (field === 'keyword') {
      updatedKeywords[index][field] = value;
    } else {
      const numValue = parseInt(value) || 0;
      if ((field === 'position' || field === 'targetPosition') && (numValue < 1 || numValue > 100)) return;
      if (field === 'searchVolume' && numValue < 0) return;
      updatedKeywords[index][field] = numValue;
    }
    setKeywords(updatedKeywords);
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // CTR Model with consistent rounding using Math.ceil
  const getCTR = (position) => {
    const ctrTable = { 1: 0.317, 2: 0.247, 3: 0.187, 4: 0.133, 5: 0.095, 6: 0.068, 7: 0.049, 8: 0.035, 9: 0.025, 10: 0.018 };
    const roundedPosition = Math.ceil(position); // Use Math.ceil for consistent rounding
    return roundedPosition <= 10 ? ctrTable[roundedPosition] : 0.01;
  };

  // Seasonality Data for Categories
  const getSeasonalityMultiplier = (month, category) => {
    const seasonality = {
      "BBQ & Outdoor Cooking": { 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.3, 8: 1.2, 9: 1.1, 10: 1.0, 11: 0.9, 12: 0.8 },
      "Christmas & Seasonal": { 1: 0.8, 2: 0.7, 3: 0.6, 4: 0.5, 5: 0.5, 6: 0.6, 7: 0.7, 8: 0.8, 9: 0.9, 10: 1.0, 11: 1.2, 12: 1.5 },
      "Fashion & Apparel": { 1: 1.0, 2: 1.1, 3: 1.0, 4: 0.9, 5: 1.0, 6: 1.1, 7: 1.0, 8: 1.0, 9: 1.1, 10: 1.2, 11: 1.3, 12: 1.2 }
    };
    return seasonality[category]?.[month] || 1.0;
  };

  // Forecast Algorithm with Error Handling and Loading State
  const calculateForecast = () => {
    try {
      setLoading(true); // Start loading
      const { conversionRate, projectionPeriod, averageOrderValue, investment } = settings;
      console.log("Settings:", settings); // Debug log
      console.log("Keywords:", keywords); // Debug log

      if (!projectionPeriod || projectionPeriod < 1 || projectionPeriod > 12) {
        setValidationError("Projection period must be between 1 and 12 months.");
        setLoading(false);
        return;
      }

      const projections = [];
      let totalTraffic = 0, totalConversions = 0, totalRevenue = 0;

      for (let month = 1; month <= projectionPeriod; month++) {
        let monthlyTraffic = 0, monthlyConversions = 0, monthlyRevenue = 0;

        keywords.forEach(keyword => {
          const { searchVolume, position, targetPosition } = keyword;
          if (!searchVolume || !position || !targetPosition) {
            throw new Error(`Invalid keyword data: ${JSON.stringify(keyword)}`);
          }

          const positionDelta = (position - targetPosition) / projectionPeriod;
          const currentMonthPosition = Math.max(targetPosition, position - positionDelta * (month - 1));
          const ctr = getCTR(currentMonthPosition);
          const seasonality = getSeasonalityMultiplier(month, settings.category);
          const traffic = searchVolume * ctr * seasonality;
          const conversions = traffic * (conversionRate / 100);
          const revenue = conversions * averageOrderValue;

          monthlyTraffic += traffic;
          monthlyConversions += conversions;
          monthlyRevenue += revenue;
        });

        totalTraffic += monthlyTraffic;
        totalConversions += monthlyConversions;
        totalRevenue += monthlyRevenue;

        projections.push({
          month: new Date(2025, month - 1).toLocaleString('default', { month: 'short' }),
          traffic: Math.round(monthlyTraffic),
          conversions: Math.round(monthlyConversions),
          revenue: monthlyRevenue.toFixed(2),
          roi: (((totalRevenue - investment) / investment) * 100).toFixed(1)
        });
      }

      console.log("Projections:", projections); // Debug log
      setProjections(projections);
      setValidationError("");
    } catch (error) {
      console.error("Error in calculateForecast:", error);
      setValidationError("An error occurred while calculating the forecast. Check the console for details.");
    } finally {
      setLoading(false); // End loading
    }
  };

  // Export Projections as CSV
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

  // Chart Data
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
          </ul>
          <p className="mt-1 text-sm">Example: "gas bbq",8000,8,3</p>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select className="w-full border p-2 rounded" value={settings.category} onChange={(e) => setSettings({ ...settings, category: e.target.value })}>
              <option>BBQ & Outdoor Cooking</option>
              <option>Christmas & Seasonal</option>
              <option>Fashion & Apparel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Projection Period (Months)</label>
            <input type="number" min="1" max="12" className="w-full border p-2 rounded" value={settings.projectionPeriod} onChange={(e) => setSettings({ ...settings, projectionPeriod: parseInt(e.target.value) || 6 })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Currency</label>
            <select className="w-full border p-2 rounded" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
              <option>GBP (£)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Conversion Rate (%)</label>
            <input type="number" min="0" max="100" className="w-full border p-2 rounded" value={settings.conversionRate} onChange={(e) => setSettings({ ...settings, conversionRate: parseFloat(e.target.value) || 3.0 })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Average Order Value</label>
            <input type="number" min="0" className="w-full border p-2 rounded" value={settings.averageOrderValue} onChange={(e) => setSettings({ ...settings, averageOrderValue: parseInt(e.target.value) || 250 })} />
          </div>
          <div>
            <label className="block text-sm mb-1">SEO Investment</label>
            <input type="number" min="0" className="w-full border p-2 rounded" value={settings.investment} onChange={(e) => setSettings({ ...settings, investment: parseInt(e.target.value) || 5000 })} />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Keywords</h2>
          <button onClick={() => setShowNewKeywordForm(true)} className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700">
            + Add Keyword
          </button>
        </div>
        {validationError && <div className="mb-2 p-2 bg-red-50 rounded text-red-700">{validationError}</div>}
        {showNewKeywordForm && (
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="font-medium mb-3">Add New Keyword</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><label className="block text-sm mb-1">Keyword</label><input type="text" className="w-full border p-2 rounded" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} /></div>
              <div><label className="block text-sm mb-1">Search Volume</label><input type="number" min="1" className="w-full border p-2 rounded" value={newVolume} onChange={(e) => setNewVolume(e.target.value)} /></div>
              <div><label className="block text-sm mb-1">Current Position</label><input type="number" min="1" max="100" className="w-full border p-2 rounded" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} /></div>
              <div><label className="block text-sm mb-1">Target Position</label><input type="number" min="1" max="100" className="w-full border p-2 rounded" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} /></div>
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={resetNewKeywordForm} className="bg-gray-400 text-white py-1 px-3 rounded mr-2 hover:bg-gray-500">Cancel</button>
              <button onClick={addKeyword} className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700">Add Keyword</button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">Keyword</th>
                <th className="p-2 border text-right">Search Volume</th>
                <th className="p-2 border text-center">Current Position</th>
                <th className="p-2 border text-center">Target Position</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((keyword, index) => (
                <tr key={index}>
                  <td className="p-2 border"><input type="text" className="w-full border p-1 rounded" value={keyword.keyword} onChange={(e) => updateKeyword(index, 'keyword', e.target.value)} /></td>
                  <td className="p-2 border"><input type="number" min="0" className="w-full border p-1 rounded text-right" value={keyword.searchVolume} onChange={(e) => updateKeyword(index, 'searchVolume', e.target.value)} /></td>
                  <td className="p-2 border"><input type="number" min="1" max="100" className="w-20 border p-1 rounded text-center mx-auto block" value={keyword.position} onChange={(e) => updateKeyword(index, 'position', e.target.value)} /></td>
                  <td className="p-2 border"><input type="number" min="1" max="100" className="w-20 border p-1 rounded text-center mx-auto block" value={keyword.targetPosition} onChange={(e) => updateKeyword(index, 'targetPosition', e.target.value)} /></td>
                  <td className="p-2 border text-center"><button onClick={() => removeKeyword(index)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs">Remove</button></td>
                </tr>
              ))}
              {keywords.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No keywords added.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculate Forecast */}
      <div className="mb-4">
        <button
          onClick={calculateForecast}
          className="bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Forecast"}
        </button>
      </div>

      {/* Projections */}
      {projections.length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Monthly Projections</h2>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left">Month</th>
                  <th className="p-2 border text-right">Traffic</th>
                  <th className="p-2 border text-right">Conversions</th>
                  <th className="p-2 border text-right">Revenue ({settings.currency.split(' ')[1]})</th>
                  <th className="p-2 border text-right">ROI</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((proj, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{proj.month}</td>
                    <td className="p-2 border text-right">{proj.traffic}</td>
                    <td className="p-2 border text-right">{proj.conversions}</td>
                    <td className="p-2 border text-right">{proj.revenue}</td>
                    <td className="p-2 border text-right">{proj.roi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visualization */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Traffic & Revenue Trends</h2>
            <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </div>
        </>
      )}

      {/* Export Buttons */}
      <div className="flex justify-end mt-4">
        <button className="bg-blue-600 text-white py-2 px-4 rounded font-medium mr-2 hover:bg-blue-700" onClick={downloadProjectionsCSV}>
          Export Results
        </button>
        <button className="bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700" onClick={downloadProjectionsCSV}>
          Download CSV
        </button>
      </div>
    </div>
  );
}

export default UpdatedSEOTool;
