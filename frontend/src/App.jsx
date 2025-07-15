import React, { useState } from 'react';
import UploadPredict from './components/UploadPredict';
import ResultDisplay from './components/ResultDisplay';

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">🌊 Real-Time Flood Detection Dashboard</h1>
      <UploadPredict />
    </div>
  );
}

export default App;
