// src/components/SettingsForm.tsx

import React from 'react';

interface Settings {
  category: string;
  projectionPeriod: number;
  currency: string;
  conversionRate: number;
  investment: number;
  averageOrderValue: number;
  ctrModel: string;
}

interface SettingsFormProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, setSettings }) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">
            Category
            <span className="ml-1 text-gray-500 cursor-help" title="Select the category that best matches your business to apply seasonal trends.">[?]</span>
          </label>
          <select className="w-full border p-2 rounded" value={settings.category} onChange={(e) => setSettings({ ...settings, category: e.target.value })}>
            <option>BBQ & Outdoor Cooking</option>
            <option>Christmas & Seasonal</option>
            <option>Fashion & Apparel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">
            Projection Period (Months)
            <span className="ml-1 text-gray-500 cursor-help" title="Number of months to forecast (1-12).">[?]</span>
          </label>
          <input
            type="number"
            min="1"
            max="12"
            className="w-full border p-2 rounded"
            value={settings.projectionPeriod}
            onChange={(e) => setSettings({ ...settings, projectionPeriod: parseInt(e.target.value) || 6 })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">
            Currency
            <span className="ml-1 text-gray-500 cursor-help" title="Select the currency for revenue calculations.">[?]</span>
          </label>
          <select className="w-full border p-2 rounded" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
            <option>GBP (£)</option>
            <option>USD ($)</option>
            <option>EUR (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">
            Conversion Rate (%)
            <span className="ml-1 text-gray-500 cursor-help" title="The percentage of visitors who make a purchase (e.g., 3% means 3 out of 100 visitors convert).">[?]</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full border p-2 rounded"
            value={settings.conversionRate}
            onChange={(e) => setSettings({ ...settings, conversionRate: parseFloat(e.target.value) || 3.0 })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">
            Average Order Value
            <span className="ml-1 text-gray-500 cursor-help" title="The average amount spent per purchase in your selected currency.">[?]</span>
          </label>
          <input
            type="number"
            min="0"
            className="w-full border p-2 rounded"
            value={settings.averageOrderValue}
            onChange={(e) => setSettings({ ...settings, averageOrderValue: parseInt(e.target.value) || 250 })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">
            SEO Investment
            <span className="ml-1 text-gray-500 cursor-help" title="The total amount you plan to spend on SEO efforts for this campaign.">[?]</span>
          </label>
          <input
            type="number"
            min="0"
            className="w-full border p-2 rounded"
            value={settings.investment}
            onChange={(e) => setSettings({ ...settings, investment: parseInt(e.target.value) || 5000 })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">
            CTR Model
            <span className="ml-1 text-gray-500 cursor-help" title="Select a click-through rate model based on your industry, or choose Custom to define your own.">[?]</span>
          </label>
          <select className="w-full border p-2 rounded" value={settings.ctrModel} onChange={(e) => setSettings({ ...settings, ctrModel: e.target.value })}>
            <option>Default</option>
            <option>E-commerce</option>
            <option>Informational</option>
            <option>Custom</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;
