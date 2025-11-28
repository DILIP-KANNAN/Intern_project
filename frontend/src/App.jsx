import React, { useState } from 'react';
import UploadPredict from './components/UploadPredict';

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">

      <div className='flex flex-row justify-center items-center w-full'>
      <img 
        src="\img.png" 
        alt="App Logo" 
        className="w-28 h-28 object-contain px-6 drop-shadow-md"
      />
      
      <h1 className="text-3xl font-bold text-center">
        Geo AI Flood Segmentation
      </h1>

      </div>

      <UploadPredict />
    </div>

  );
}

export default App;
