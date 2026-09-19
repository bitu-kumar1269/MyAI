import { useState, useRef } from "react";
import {
  Eraser,
  Sparkles,
  UploadCloud,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const bgPresets = [
  { id: "transparent", label: "Transparent", class: "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-white" },
  { id: "white", label: "Pure White", class: "bg-white" },
  { id: "dark", label: "Studio Dark", class: "bg-slate-900" },
  { id: "gradient", label: "Soft Gradient", class: "bg-gradient-to-tr from-rose-100 via-purple-100 to-teal-100" },
];

const RemoveBackground = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOriginal, setPreviewOriginal] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeBg, setActiveBg] = useState("transparent");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState("slider"); // 'slider' | 'side-by-side'

  const sliderRef = useRef(null);
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose a valid image file.");
        return;
      }
      setSelectedFile(file);
      setPreviewOriginal(URL.createObjectURL(file));
      setContent("");
    }
  };

  const onSubmitHandler = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload an image first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", selectedFile);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Background removed cleanly!");
      } else {
        toast.error(data.message || "Failed to remove background.");
      }
    } catch (error) {
      toast.error(error.message || "Error processing image.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!content) return;
    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `no-bg-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Transparent PNG downloaded!");
    } catch {
      window.open(content, "_blank");
    }
  };

  const handleCopyLink = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Image URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSliderMove = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewOriginal("");
    setContent("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-slate-700">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4938] to-[#F6AB41] flex items-center justify-center text-white shadow-sm">
            <Eraser className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              AI Background Remover
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Instantly extract subjects and isolate backgrounds with pixel-perfect precision
            </p>
          </div>
        </div>

        {(previewOriginal || content) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:text-slate-900 px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            Upload New Image
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Options (5 cols) */}
        <form
          onSubmit={onSubmitHandler}
          className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Layers className="w-4 h-4 text-[#FF4938]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Source Image
            </h2>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-gray-200 hover:border-[#FF4938] transition rounded-2xl p-6 cursor-pointer bg-slate-50/50 text-center">
            <input
              id="bg-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="bg-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#FF4938] flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : "Choose an image"}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready`
                  : "Drag & drop or click to upload (JPG, PNG, WEBP)"}
              </span>
            </label>
          </div>

          {/* Background Presets for Preview */}
          {content && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-slate-700">
                Preview Canvas Background
              </label>
              <div className="grid grid-cols-2 gap-2">
                {bgPresets.map((bg) => (
                  <button
                    type="button"
                    key={bg.id}
                    onClick={() => setActiveBg(bg.id)}
                    className={`p-2 px-3 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                      activeBg === bg.id
                        ? "bg-rose-50 text-[#FF4938] border-[#FF4938] font-semibold"
                        : "border-gray-200 hover:bg-gray-50 text-slate-600"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border border-gray-300 ${bg.class}`}></span>
                    <span>{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition ${
              loading || !selectedFile
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#F6AB41] to-[#FF4938] hover:opacity-95 shadow-rose-500/20 shadow-md"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Extracting Foreground...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Remove Background</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Interactive Before / After Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[560px] overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Eraser className="w-4 h-4 text-[#FF4938]" />
              <h2 className="text-sm font-bold text-slate-800">Processed Preview</h2>
            </div>

            {content && (
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setViewMode("slider")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      viewMode === "slider"
                        ? "bg-white text-slate-800 shadow-2xs font-semibold"
                        : "text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    Compare Slider
                  </button>
                  <button
                    onClick={() => setViewMode("side-by-side")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      viewMode === "side-by-side"
                        ? "bg-white text-slate-800 shadow-2xs font-semibold"
                        : "text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    Result Only
                  </button>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 text-xs font-semibold p-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer text-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs font-bold p-1.5 px-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            )}
          </div>

          {/* Display Area */}
          <div className="flex-1 p-6 flex items-center justify-center bg-slate-50/50">
            {!content && !previewOriginal && !loading && (
              <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#FF4938] flex items-center justify-center mb-4">
                  <Eraser className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Ready to remove background?
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Upload an image on the left and click "Remove Background" to see the cut-out comparison.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-rose-100 border-t-[#FF4938] animate-spin"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Removing background with Cloudinary AI...
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Analyzing subject contours and generating transparency mask
                  </p>
                </div>
              </div>
            )}

            {/* Original Preview before removal */}
            {!loading && previewOriginal && !content && (
              <div className="max-h-[460px] max-w-full flex items-center justify-center rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                <img
                  src={previewOriginal}
                  alt="Original preview"
                  className="max-h-[440px] w-auto object-contain rounded-lg"
                />
              </div>
            )}

            {/* After Removal: Interactive Comparison Slider */}
            {!loading && content && viewMode === "slider" && previewOriginal && (
              <div
                ref={sliderRef}
                onMouseMove={handleSliderMove}
                onTouchMove={handleSliderMove}
                className="relative w-full max-w-md max-h-[460px] h-[380px] rounded-xl overflow-hidden select-none border border-gray-200 shadow-md cursor-ew-resize"
              >
                {/* Background Layer: Processed Result with chosen BG style */}
                <div
                  className={`absolute inset-0 w-full h-full flex items-center justify-center ${
                    bgPresets.find((b) => b.id === activeBg)?.class
                  }`}
                >
                  <img
                    src={content}
                    alt="Background removed"
                    className="max-h-[380px] w-auto object-contain pointer-events-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[11px] font-bold px-2 py-1 bg-black/60 text-white rounded-md backdrop-blur-xs">
                    Removed
                  </span>
                </div>

                {/* Foreground Layer: Original clipped */}
                <div
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-white pointer-events-none"
                >
                  <img
                    src={previewOriginal}
                    alt="Original"
                    className="max-h-[380px] w-auto object-contain pointer-events-none"
                  />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2 py-1 bg-black/60 text-white rounded-md backdrop-blur-xs">
                    Original
                  </span>
                </div>

                {/* Split Handle */}
                <div
                  style={{ left: `${sliderPosition}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none flex items-center justify-center"
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-slate-700 text-xs font-bold -ml-4">
                    <Sliders className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* After Removal: Result Only View */}
            {!loading && content && viewMode === "side-by-side" && (
              <div
                className={`max-h-[460px] w-full max-w-md h-[380px] rounded-xl overflow-hidden border border-gray-200 shadow-md flex items-center justify-center ${
                  bgPresets.find((b) => b.id === activeBg)?.class
                }`}
              >
                <img
                  src={content}
                  alt="Transparent result"
                  className="max-h-[360px] w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;