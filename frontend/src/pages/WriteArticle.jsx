import { useState } from "react";
import {
  SquarePen,
  Sparkles,
  Copy,
  Check,
  Download,
  Clock,
  FileText,
  Hash,
  Layers,
  Wand2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const tones = [
  "Professional",
  "Engaging & Viral",
  "Informative & Educational",
  "Persuasive",
  "Conversational",
];

const lengths = [
  { length: 800, label: "Short", words: "500 - 800 words", readTime: "3 min" },
  { length: 1400, label: "Medium", words: "800 - 1,200 words", readTime: "5 min" },
  { length: 2200, label: "Deep Dive", words: "1,200+ words", readTime: "8 min" },
];

const promptSuggestions = [
  "How Generative AI is Reshaping Modern Software Engineering",
  "The 80/20 Rule of High-Performance Leadership",
  "Complete Guide to Next-Gen Web Development in 2026",
  "Why Micro-Habits Outperform Radical Life Changes",
];

const WriteArticle = () => {
  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState(tones[0]);
  const [selectedLength, setSelectedLength] = useState(lengths[0]);
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { getToken } = useAuth();

  const wordsCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charsCount = content.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordsCount / 200));

  const onSubmitHandler = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter an article topic.");
      return;
    }

    try {
      setLoading(true);
      const prompt = `Write an article about ${topic} in ${selectedLength.words}`;

      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          prompt,
          topic,
          length: selectedLength.length,
          tone: selectedTone,
          audience,
          keywords,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Article generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate article.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Article copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (ext) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `article-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as .${ext}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-slate-700">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3588F2] to-[#0BB0D7] flex items-center justify-center text-white shadow-sm">
            <SquarePen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              AI Article Writer
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Generate publication-ready articles with SEO structure, custom tones, and high-impact conclusions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (5 cols) */}
        <form
          onSubmit={onSubmitHandler}
          className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Wand2 className="w-4 h-4 text-[#3588F2]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Article Configuration
            </h2>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Article Topic or Headline <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The impact of quantum computing on modern cybersecurity..."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:border-[#3588F2] focus:ring-2 focus:ring-[#3588F2]/10 outline-none transition"
              required
            />
            {/* Quick Inspiration Chips */}
            <div className="mt-2 space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">
                Quick ideas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptSuggestions.slice(0, 2).map((sugg, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setTopic(sugg)}
                    className="text-[11px] text-left text-gray-500 hover:text-[#3588F2] bg-gray-50 hover:bg-blue-50/50 p-1 px-2 rounded-md border border-gray-100 transition truncate max-w-full"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Writing Tone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tones.map((tone) => (
                <button
                  type="button"
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    selectedTone === tone
                      ? "bg-blue-50 text-[#226BFF] border-blue-200 shadow-2xs font-semibold"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Length Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {lengths.map((item) => (
                <div
                  key={item.label}
                  onClick={() => setSelectedLength(item)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                    selectedLength.label === item.label
                      ? "bg-blue-50 border-[#3588F2] text-[#226BFF] shadow-2xs"
                      : "border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.readTime}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Audience & Keywords Accordion */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Software engineers, Startup founders, Students"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#3588F2] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Focus Keywords <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. artificial intelligence, productivity, cloud architecture"
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#3588F2] outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition ${
              loading || !topic.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#226BFF] to-[#65ADFF] hover:opacity-95 shadow-blue-500/20 shadow-md"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Crafting Article...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Article</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Output Viewer & Toolbar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[560px]">
          {/* Output Toolbar */}
          <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3588F2]" />
              <h2 className="text-sm font-bold text-slate-800">
                Generated Article
              </h2>
            </div>

            {content && (
              <div className="flex items-center gap-2">
                {/* Metrics */}
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-gray-500 mr-2 border-r border-gray-200 pr-3">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" />
                    {wordsCount} words
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{estimatedReadTime} min read
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold p-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer text-slate-700"
                  title="Copy markdown text"
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
                  onClick={() => handleDownload("md")}
                  className="flex items-center gap-1.5 text-xs font-semibold p-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer text-slate-700"
                  title="Download Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.MD</span>
                </button>

                <button
                  onClick={() => handleDownload("txt")}
                  className="flex items-center gap-1.5 text-xs font-semibold p-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer text-slate-700"
                  title="Download Text"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.TXT</span>
                </button>
              </div>
            )}
          </div>

          {/* Article Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!content && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#3588F2] flex items-center justify-center mb-4">
                  <SquarePen className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Ready to write something remarkable?
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Configure your topic, select a tone, and click "Generate Article" to create comprehensive, publication-ready copy.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-[#226BFF] animate-spin"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Drafting your article with Gemini 2.5...
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Structuring headings, body paragraphs, and formatting takeaways
                  </p>
                </div>
              </div>
            )}

            {content && !loading && (
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
                <div className="reset-tw">
                  <Markdown>{content}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteArticle;