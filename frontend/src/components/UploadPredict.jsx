import React, { useState } from "react";

const UploadPredict = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [insights, setInsights] = useState(null);
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      setOriginalImage(URL.createObjectURL(file));
      setMaskImage(null);
      setInsights(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Prediction failed");

      const data = await response.json();
      setMaskImage(`data:image/png;base64,${data.mask_image_base64}`);
      setInsights({
        floodPercent: data.flood_percent,
        riskLevel: data.risk_level,
        prediction: data.prediction,
      });
    } catch (error) {
      console.error(error);
      alert("Error during prediction.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    if (!riskLevel) return "bg-slate-500";
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const handleDownloadMask = () => {
    if (!maskImage) return;

    const link = document.createElement("a");
    link.href = maskImage;
    link.download = selectedFile
      ? `${selectedFile.name.replace(/\.[^/.]+$/, "")}_mask.png`
      : "flood_mask.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 dark:text-slate-100 transition-colors">

        {/* -------- HEADER -------- */}
        <header className="w-full border-b dark:border-slate-800 border-slate-300 bg-gradient-to-r from-sky-600/20 via-white dark:via-slate-900 to-emerald-600/20">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Flood Segmentation Dashboard
              </h1>
              <p className="text-xs md:text-sm opacity-80">
                Real-time Geo-AI impact analysis from aerial imagery
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow hover:scale-105 transition text-sm"
            >
              {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto p-6 flex flex-col gap-6 w-full">

          {/* -------- UPLOAD CARD -------- */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 shadow-lg p-6 mx-auto text-center w-full max-w-md">
            <h2 className="text-lg font-semibold">Upload an Image</h2>
            <p className="text-xs opacity-70 mt-1">
                Supported: Aerial / Satellite images (JPG, PNG)
            </p>

            {/* Input */}
            <div className="mt-4 flex flex-col items-center gap-4">
                <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="p-2 border rounded-xl bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 w-full text-center"
                />

                <button
                onClick={handleUpload}
                disabled={loading}
                className={`px-6 py-2 rounded-xl text-white text-sm shadow transition ${
                    loading
                    ? "bg-sky-400/70 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
                >
                {loading ? "Analyzing..." : "Upload & Analyze"}
                </button>
            </div>
            </div>


          {/* -------- RESULTS -------- */}
          {originalImage && maskImage && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

              {/* Visual Outputs */}
              <div className="lg:col-span-2 space-y-6">

                {/* Overlay View */}
                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 shadow-lg p-5 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Visual Output</h3>
                    <button
                      onClick={() => setShowOverlay(!showOverlay)}
                      className="text-xs px-3 py-1 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      {showOverlay ? "Hide Overlay" : "Show Overlay"}
                    </button>
                  </div>

                  {/* Image */}
                  <div className="relative mt-4 rounded-xl overflow-hidden">
                    <img src={originalImage} className="rounded-xl w-full" />
                    {showOverlay && (
                      <img
                        src={maskImage}
                        className="absolute inset-0 w-full h-full rounded-xl opacity-50 mix-blend-multiply pointer-events-none"
                      />
                    )}
                  </div>
                </div>

                {/* Mask Alone */}
                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 shadow-lg p-5">
                  <h3 className="text-lg font-semibold mb-3">
                    Predicted Mask (Full Resolution)
                  </h3>
                  <img src={maskImage} className="rounded-xl w-full shadow" />
                </div>
              </div>

              {/* Insights + Model Info */}
              <div className="space-y-6">

                {/* Insights */}
                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 shadow-lg p-5">
                  <h3 className="text-lg font-semibold mb-3">Insights</h3>
                  <p className="text-sm">
                    Flood Coverage: <b>{insights.floodPercent}%</b>
                  </p>
                  <p className="text-sm">
                    Risk Level:{" "}
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs ${getRiskColor(
                        insights.riskLevel
                      )}`}
                    >
                      {insights.riskLevel}
                    </span>
                  </p>
                  <p className="text-sm mt-2 opacity-80">
                    Prediction: {insights.prediction}
                  </p>
                </div>

                {/* Model Info */}
                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 shadow-lg p-5">
                  <h3 className="text-lg font-semibold mb-3">Model Details</h3>
                  <ul className="text-sm opacity-90 space-y-1">
                    <li>Architecture: U-Net Segmentation Model</li>
                    <li>Framework: PyTorch</li>
                    <li>Backend: Flask API</li>
                    <li>Frontend: React + Tailwind CSS</li>
                  </ul>

                  <button
                    onClick={handleDownloadMask}
                    className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm shadow"
                  >
                    Download Mask (PNG)
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* -------- FOOTER -------- */}
        <footer className="mt-10 bg-slate-100 dark:bg-slate-950 border-t dark:border-slate-800 border-slate-300">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">

            <div>
              <h4 className="font-bold mb-2">What this system does</h4>
              <p>
                Performs pixel-wise flood detection using deep learning.
                Helps visualize submerged regions instantly using segmentation masks.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">How it works</h4>
              <p>
                A U-Net model trained on flood datasets analyzes uploaded images.
                A Flask API returns the mask + insights, rendered beautifully on React.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Technologies</h4>
              <p>
                PyTorch · Flask · React · Tailwind · Geo-AI  
                <br />
                Internship Project @ NSIC, Ekkattuthangal — For research & academic use.
              </p>
            </div>

          </div>
        </footer>
      </div>
    </div>
  );
};

export default UploadPredict;
