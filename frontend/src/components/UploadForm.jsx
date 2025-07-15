import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = ({ setResult }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({
        original: `http://127.0.0.1:5000/${res.data.original_image_url}`,
        mask: `http://127.0.0.1:5000/${res.data.mask_image_url}`,
        prediction: res.data.prediction,
      });
    } catch (err) {
      console.error(err);
      alert("Error while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-auto flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Upload Disaster Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {selectedFile && (
        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
      )}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>
    </div>
  );
};

export default UploadForm;
