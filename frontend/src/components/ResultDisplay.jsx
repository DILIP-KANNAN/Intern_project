import React, { useState } from 'react';

const ResultDisplay = ({ result }) => {
  const [showOverlay, setShowOverlay] = useState(false);

  if (!result) return null;

  const getPredictionColor = (prediction) => {
    if (!prediction) return 'bg-gray-500'; // fallback
    switch (prediction.toLowerCase()) {
      case 'flood': return 'bg-blue-600';
      case 'fire': return 'bg-red-600';
      case 'collapse': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = "prediction.json";
    link.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-4xl mx-auto flex flex-col items-center gap-6">
      <div className="flex flex-col md:flex-row items-center gap-6 w-full">
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold mb-2">Original Image</h3>
          <div className="relative">
            <img src={result.original} alt="Original" className="rounded shadow" />
            {showOverlay && (
              <img src={result.mask} alt="Overlay Mask" className="absolute top-0 left-0 w-full h-full opacity-60 rounded" />
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold">Disaster Info</h3>
          <span className={`text-white px-4 py-1 rounded-full ${getPredictionColor(result.prediction)}`}>
            {result.prediction || "Unknown"}
          </span>
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {showOverlay ? "Hide Mask Overlay" : "Show Mask Overlay"}
          </button>
          <button
            onClick={() => downloadImage(result.mask, "predicted_mask.png")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download Mask
          </button>
          <button
            onClick={downloadJSON}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Download JSON
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Powered by Geo-AI</p>
    </div>
  );
};

export default ResultDisplay;
