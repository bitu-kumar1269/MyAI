import { useState, useRef } from "react";
import {
  Scissors,
  Sparkles,
  UploadCloud,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Layers,
  Wand2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const quickObjects = [
  "watermark",
  "person",
  "text",
  "watch",
  "car",
  "glasses",
  "logo",
];

const RemoveObject = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOriginal, setPreviewOriginal] = useState("");
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState("slider"); // 'slider' | 'result'

  const sliderRef = useRef(null);
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
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

    const trimmedObj = object.trim();
    if (!trimmedObj) {
      toast.error("Please enter the name of the object to erase.");
      return;
    }

    if (trimmedObj.split(" ").length > 2) {
      toast.error("Please enter 1 or 2 words (e.g., 'watch' or 'red car').");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("object", trimmedObj);

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success(`Removed ${trimmedObj} successfully!`);
      } else {
        toast.error(data.message || "Failed to remove object.");
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
      a.download = `erased-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
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
    setObject("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-slate-700">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#417DF6] to-[#8E37EB] flex items-center justify-center text-white shadow-sm">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              AI Object Remover & Inpainting
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Erase unwanted objects, photobombers, or watermarks while seamlessly reconstructing background textures
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
        {/* Left Column: Form Controls (5 cols) */}
        <form
          onSubmit={onSubmitHandler}
          className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Layers className="w-4 h-4 text-[#417DF6]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Object Eraser
            </h2>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-gray-200 hover:border-[#417DF6] transition rounded-2xl p-6 cursor-pointer bg-slate-50/50 text-center">
            <input
              id="object-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="object-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#417DF6] flex items-center justify-center mb-3">
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

          {/* Object Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Object to Erase <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={object}
              onChange={(e) => setObject(e.target.value)}
              placeholder="e.g., watch, person, watermark..."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:border-[#417DF6] focus:ring-2 focus:ring-[#417DF6]/10 outline-none transition"
              required
            />

            {/* Quick Object Suggestions */}
            <div className="mt-2 space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">
                Common objects:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickObjects.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setObject(item)}
                    className="text-[11px] text-gray-500 hover:text-[#417DF6] bg-gray-50 hover:bg-blue-50/50 p-1 px-2.5 rounded-md border border-gray-100 transition capitalize"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedFile || !object.trim()}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition ${
              loading || !selectedFile || !object.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#417DF6] to-[#8E37EB] hover:opacity-95 shadow-blue-500/20 shadow-md"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Erasing & Inpainting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Erase Object</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Output Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[560px] overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#417DF6]" />
              <h2 className="text-sm font-bold text-slate-800">Inpainted Result</h2>
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
                    onClick={() => setViewMode("result")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      viewMode === "result"
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
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Display Area */}
          <div className="flex-1 p-6 flex items-center justify-center bg-slate-50/50">
            {!content && !previewOriginal && !loading && (
              <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#417DF6] flex items-center justify-center mb-4">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Erase any object cleanly
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Upload an image, type the name of the item to erase, and let AI inpaint the empty space seamlessly.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-[#417DF6] animate-spin"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Erasing {object} with Generative AI...
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Analyzing background pixels and reconstructing continuous textures
                  </p>
                </div>
              </div>
            )}

            {/* Original Preview before erasure */}
            {!loading && previewOriginal && !content && (
              <div className="max-h-[460px] max-w-full flex items-center justify-center rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                <img
                  src={previewOriginal}
                  alt="Original preview"
                  className="max-h-[440px] w-auto object-contain rounded-lg"
                />
              </div>
            )}

            {/* Inpainted Comparison Slider */}
            {!loading && content && viewMode === "slider" && previewOriginal && (
              <div
                ref={sliderRef}
                onMouseMove={handleSliderMove}
                onTouchMove={handleSliderMove}
                className="relative w-full max-w-md max-h-[460px] h-[380px] rounded-xl overflow-hidden select-none border border-gray-200 shadow-md cursor-ew-resize bg-black"
              >
                {/* Background Layer: Erased Result */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <img
                    src={content}
                    alt="Erased result"
                    className="max-h-[380px] w-auto object-contain pointer-events-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[11px] font-bold px-2 py-1 bg-black/60 text-white rounded-md backdrop-blur-xs">
                    Object Erased
                  </span>
                </div>

                {/* Foreground Layer: Original clipped */}
                <div
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-black pointer-events-none"
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

                {/* Slider Handle */}
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

            {/* Result Only View */}
            {!loading && content && viewMode === "result" && (
              <div className="max-h-[460px] w-full max-w-md h-[380px] rounded-xl overflow-hidden border border-gray-200 shadow-md flex items-center justify-center bg-black">
                <img
                  src={content}
                  alt="Inpainted result"
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

export default RemoveObject;
