// src/components/KeywordsTable.tsx

import React from 'react';

interface Keyword {
  keyword: string;
  searchVolume: number;
  position: number;
  targetPosition: number;
  difficulty: number; // New field for competitor difficulty
}

interface KeywordsTableProps {
  keywords: Keyword[];
  setKeywords: React.Dispatch<React.SetStateAction<Keyword[]>>;
  showNewKeywordForm: boolean;
  setShowNewKeywordForm: React.Dispatch<React.SetStateAction<boolean>>;
  newKeyword: string;
  setNewKeyword: React.Dispatch<React.SetStateAction<string>>;
  newVolume: string;
  setNewVolume: React.Dispatch<React.SetStateAction<string>>;
  newPosition: string;
  setNewPosition: React.Dispatch<React.SetStateAction<string>>;
  newTarget: string;
  setNewTarget: React.Dispatch<React.SetStateAction<string>>;
  newDifficulty: string;
  setNewDifficulty: React.Dispatch<React.SetStateAction<string>>;
  validationError: string;
  setValidationError: React.Dispatch<React.SetStateAction<string>>;
}

const KeywordsTable: React.FC<KeywordsTableProps> = ({
  keywords,
  setKeywords,
  showNewKeywordForm,
  setShowNewKeywordForm,
  newKeyword,
  setNewKeyword,
  newVolume,
  setNewVolume,
  newPosition,
  setNewPosition,
  newTarget,
  setNewTarget,
  newDifficulty,
  setNewDifficulty,
  validationError,
  setValidationError
}) => {
  const addKeyword = () => {
    const volume = parseInt(newVolume) || 0;
    const position = parseInt(newPosition) || 20;
    const targetPosition = parseInt(newTarget) || 10;
    const difficulty = parseInt(newDifficulty) || 50;

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
    if (difficulty < 1 || difficulty > 100) {
      setValidationError("Difficulty must be between 1 and 100.");
      return;
    }

    setKeywords([...keywords, { keyword: newKeyword, searchVolume: volume, position, targetPosition, difficulty }]);
    setValidationError("");
    resetNewKeywordForm();
  };

  const resetNewKeywordForm = () => {
    setNewKeyword("");
    setNewVolume("");
    setNewPosition("");
    setNewTarget("");
    setNewDifficulty("");
    setShowNewKeywordForm(false);
  };

  const updateKeyword = (index: number, field: keyof Keyword, value: string | number) => {
    const updatedKeywords = [...keywords];
    if (field === 'keyword') {
      updatedKeywords[index][field] = value as string;
    } else {
      const numValue = parseInt(value as string) || 0;
      if ((field === 'position' || field === 'targetPosition') && (numValue < 1 || numValue > 100)) return;
      if (field === 'difficulty' && (numValue < 1 || numValue > 100)) return;
      if (field === 'searchVolume' && numValue < 0) return;
      updatedKeywords[index][field] = numValue;
    }
    setKeywords(updatedKeywords);
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm mb-1">
                Keyword
                <span className="ml-1 text-gray-500 cursor-help" title="The keyword or phrase you want to rank for.">[?]</span>
              </label>
              <input type="text" className="w-full border p-2 rounded" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Search Volume
                <span className="ml-1 text-gray-500 cursor-help" title="The average monthly search volume for this keyword.">[?]</span>
              </label>
              <input type="number" min="1" className="w-full border p-2 rounded" value={newVolume} onChange={(e) => setNewVolume(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Current Position
                <span className="ml-1 text-gray-500 cursor-help" title="Your current ranking position for this keyword (1-100).">[?]</span>
              </label>
              <input type="number" min="1" max="100" className="w-full border p-2 rounded" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Target Position
                <span className="ml-1 text-gray-500 cursor-help" title="The ranking position you aim to achieve (1-100).">[?]</span>
              </label>
              <input type="number" min="1" max="100" className="w-full border p-2 rounded" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Difficulty (1-100)
                <span className="ml-1 text-gray-500 cursor-help" title="The competitive difficulty of ranking for this keyword (1 = easy, 100 = very hard).">[?]</span>
              </label>
              <input type="number" min="1" max="100" className="w-full border p-2 rounded" value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value)} />
            </div>
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
            <tr className="flex flex-col md:table-row">
              <th className="p-2 border text-left md:table-cell">Keyword</th>
              <th className="p-2 border text-right md:table-cell">Search Volume</th>
              <th className="p-2 border text-center md:table-cell">Current Position</th>
              <th className="p-2 border text-center md:table-cell">Target Position</th>
              <th className="p-2 border text-center md:table-cell">Difficulty</th>
              <th className="p-2 border text-center md:table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((keyword, index) => (
              <tr key={index} className="flex flex-col md:table-row">
                <td className="p-2 border md:table-cell">
                  <input
                    type="text"
                    className="w-full border p-1 rounded"
                    value={keyword.keyword}
                    onChange={(e) => updateKeyword(index, 'keyword', e.target.value)}
                  />
                </td>
                <td className="p-2 border md:table-cell">
                  <input
                    type="number"
                    min="0"
                    className="w-full border p-1 rounded text-right"
                    value={keyword.searchVolume}
                    onChange={(e) => updateKeyword(index, 'searchVolume', e.target.value)}
                  />
                </td>
                <td className="p-2 border md:table-cell">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-20 border p-1 rounded text-center mx-auto block"
                    value={keyword.position}
                    onChange={(e) => updateKeyword(index, 'position', e.target.value)}
                  />
                </td>
                <td className="p-2 border md:table-cell">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-20 border p-1 rounded text-center mx-auto block"
                    value={keyword.targetPosition}
                    onChange={(e) => updateKeyword(index, 'targetPosition', e.target.value)}
                  />
                </td>
                <td className="p-2 border md:table-cell">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-20 border p-1 rounded text-center mx-auto block"
                    value={keyword.difficulty}
                    onChange={(e) => updateKeyword(index, 'difficulty', e.target.value)}
                  />
                </td>
                <td className="p-2 border text-center md:table-cell">
                  <button onClick={() => removeKeyword(index)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs">Remove</button>
                </td>
              </tr>
            ))}
            {keywords.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No keywords added.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeywordsTable;
