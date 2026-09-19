import { useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  Share2,
  Wand2,
  Ratio,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const imageStyles = [
  { id: "Photorealistic", label: "Photorealistic", desc: "Ultra-detailed 8K photography" },
  { id: "Anime style", label: "Anime / Ghibli", desc: "Vibrant hand-drawn aesthetic" },
  { id: "3D style", label: "3D Render", desc: "Cinema 4D / Pixar depth" },
  { id: "Cinematic", label: "Cinematic", desc: "Dramatic lighting & film grain" },
  { id: "Fantasy style", label: "Fantasy Art", desc: "Ethereal magical concept art" },
  { id: "Cyberpunk", label: "Cyberpunk", desc: "Neon hues and futuristic tech" },
];

const aspectRatios = [
  { id: "1:1", label: "Square (1:1)", icon: "■" },
  { id: "16:9", label: "Landscape (16:9)", icon: "▬" },
  { id: "9:16", label: "Story (9:16)", icon: "▮" },
];

const promptInspirations = [
  "A cyberpunk detective walking under neon rain in Tokyo, 8k resolution, volumetric light",
  "A cozy glass cabin nestled in misty pine mountains during autumn sunrise",
  "Futuristic electric sports car racing on a glowing holographic highway",
  "An ancient mystical library with floating glowing orbs and spiral staircases",
];

const GenerateImages = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(imageStyles[0].id);
  const [selectedRatio, setSelectedRatio] = useState(aspectRatios[0].id);
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter an image description.");
      return;
    }

    try {
      setLoading(true);

      const fullPrompt = `${prompt}, in ${selectedStyle}, aspect ratio ${selectedRatio}, ultra-high quality, masterpiece`;

      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt: fullPrompt, publish },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Image generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate image.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
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
      a.download = `ai-creation-${Date.now()}.png`;
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

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-slate-700">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00AD25] to-[#04FF50] flex items-center justify-center text-white shadow-sm">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              AI Image Generator
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Transform your text descriptions into stunning visual artwork with custom aesthetic styles
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration (5 cols) */}
        <form
          onSubmit={onSubmitHandler}
          className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Wand2 className="w-4 h-4 text-[#00AD25]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Creative Prompt
            </h2>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Describe Your Vision <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. An astronaut standing in a bioluminescent forest on a distant moon, cinematic lighting..."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:border-[#00AD25] focus:ring-2 focus:ring-[#00AD25]/10 outline-none transition"
              required
            />

            {/* Quick Inspiration Chips */}
            <div className="mt-2 space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">
                Try these ideas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptInspirations.slice(0, 2).map((sugg, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setPrompt(sugg)}
                    className="text-[11px] text-left text-gray-500 hover:text-[#00AD25] bg-gray-50 hover:bg-green-50/50 p-1 px-2 rounded-md border border-gray-100 transition truncate max-w-full"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Visual Style Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {imageStyles.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedStyle(item.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition ${
                    selectedStyle === item.id
                      ? "bg-green-50/80 border-[#00AD25] text-[#00AD25] shadow-2xs"
                      : "border-gray-200 hover:bg-gray-50 text-slate-700"
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Canvas Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatios.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setSelectedRatio(r.id)}
                  className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedRatio === r.id
                      ? "bg-green-50 text-[#00AD25] border-[#00AD25] font-semibold"
                      : "border-gray-200 hover:bg-gray-50 text-slate-600"
                  }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Community Publish Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Publish to Community</p>
              <p className="text-[11px] text-gray-400">
                Showcase your artwork in the community gallery
              </p>
            </div>
            <label className="relative cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => setPublish(e.target.checked)}
                checked={publish}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-[#00AD25] transition"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-4 shadow-sm"></span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition ${
              loading || !prompt.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#00AD25] to-[#04FF50] hover:opacity-95 shadow-green-500/20 shadow-md text-slate-900 font-bold"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></span>
                <span>Rendering Visuals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>Generate Artwork</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: High-Res Image Viewer & Toolbar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[560px] overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00AD25]" />
              <h2 className="text-sm font-bold text-slate-800">Artwork Canvas</h2>
            </div>

            {content && (
              <div className="flex items-center gap-2">
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
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setLightboxOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold p-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer text-slate-700"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Zoom</span>
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

          {/* Canvas Area */}
          <div className="flex-1 p-6 flex items-center justify-center bg-slate-50/50">
            {!content && !loading && (
              <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-green-50 text-[#00AD25] flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Ready to see your ideas come alive?
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Describe what you want to see, pick a visual style, and generate high-resolution AI art.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-green-100 border-t-[#00AD25] animate-spin"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Generating high-resolution artwork...
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Applying lighting models, texture synthesis, and style rendering
                  </p>
                </div>
              </div>
            )}

            {content && !loading && (
              <div className="relative group max-h-[500px] w-full flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 shadow-md bg-black">
                <img
                  src={content}
                  alt="Generated AI artwork"
                  className="max-h-[500px] w-auto object-contain cursor-pointer transition duration-300 group-hover:scale-[1.02]"
                  onClick={() => setLightboxOpen(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && content && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 p-2 rounded-2xl shadow-2xl flex flex-col items-center"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={content}
              alt="Enlarged artwork"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
            <div className="w-full mt-3 flex justify-between items-center px-4 text-xs text-gray-400">
              <span>High Resolution Preview</span>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 py-1.5 px-3 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Full Quality
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateImages;