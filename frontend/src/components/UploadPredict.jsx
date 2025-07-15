import React, { useState } from 'react';

const UploadPredict = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [predictedImage, setPredictedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setOriginalImage(URL.createObjectURL(file));
        setPredictedImage(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select an image first.");
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Prediction failed");
            }
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setPredictedImage(imageUrl);
        } catch (error) {
            console.error(error);
            alert("Error during prediction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Flood Segmentation Predictor 🌊
            </h2>

            <div className="bg-white rounded-xl shadow-md p-6 w-full flex flex-col items-center space-y-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="p-2 border border-gray-300 rounded-lg w-full max-w-sm focus:outline-none focus:border-blue-400"
                />

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`px-5 py-2 rounded-lg text-white font-medium transition 
                        ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                    {loading ? "Predicting..." : "Predict Flood Mask"}
                </button>
            </div>

            {originalImage && predictedImage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
                    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Original Image</h3>
                        <img
                            src={originalImage}
                            alt="Original"
                            className="rounded-lg shadow-md max-h-[400px] object-contain transform hover:scale-105 transition"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Predicted Mask</h3>
                        <img
                            src={predictedImage}
                            alt="Prediction"
                            className="rounded-lg shadow-md max-h-[400px] object-contain transform hover:scale-105 transition"
                        />
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-500 mt-6 text-center">Powered by Geo-AI 🚀</p>
        </div>
    );
};

export default UploadPredict;
