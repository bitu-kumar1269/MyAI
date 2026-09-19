import { useState, useMemo } from "react";
import {
  Hash,
  Sparkles,
  Copy,
  Check,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Wand2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const blogCategories = [
  "Technology",
  "Business & Startups",
  "Productivity & Career",
  "AI & Future",
  "Health & Wellness",
  "Lifestyle & Travel",
  "Finance & Crypto",
  "Marketing & SEO",
];

const toneStyles = [
  "High CTR & Viral",
  "SEO & Search Intent",
  "Thought Leadership",
  "Listicles & Numbers",
  "Curiosity & Storytelling",
];

const promptSuggestions = [
  "Remote Work Productivity",
  "AI Tools for Designers",
  "SaaS Growth Strategies",
  "Clean Code Habits",
];

const BlogTitles = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0]);
  const [selectedTone, setSelectedTone] = useState(toneStyles[0]);
  const [loading, setLoading] = useState(false);
  const [titlesData, setTitlesData] = useState(null);
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e?.preventDefault();
    if (!keyword.trim()) {
      toast.error("Please enter a topic or keyword.");
      return;
    }

    try {
      setLoading(true);
      const prompt = `Generate a blog title for the keyword ${keyword} in the category ${selectedCategory}`;

      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        {
          prompt,
          keyword,
          category: selectedCategory,
          tone: selectedTone,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        let parsed = null;
        if (data.data && Array.isArray(data.data.titles)) {
          parsed = data.data;
        } else if (typeof data.content === "string") {
          try {
            parsed = JSON.parse(data.content);
          } catch {
            setRawMarkdown(data.content);
          }
        }

        if (parsed && Array.isArray(parsed.titles)) {
          setTitlesData(parsed.titles);
          setRawMarkdown("");
        } else if (data.content) {
          setRawMarkdown(data.content);
          setTitlesData(null);
        }
        toast.success("Catchy titles generated!");
      } else {
        toast.error(data.message || "Failed to generate titles.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (titleText, idx) => {
    navigator.clipboard.writeText(titleText);
    setCopiedIndex(idx);
    toast.success("Title copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!titlesData || titlesData.length === 0) return;
    const all = titlesData.map((t, i) => `${i + 1}. ${t.title}`).join("\n");
    navigator.clipboard.writeText(all);
    toast.success("All titles copied to clipboard!");
  };

  const filteredTitles = useMemo(() => {
    if (!titlesData) return [];
    if (filterType === "all") return titlesData;
    return titlesData.filter(
      (t) => t.type?.toLowerCase() === filterType.toLowerCase()
    );
  }, [titlesData, filterType]);

  const uniqueTypes = useMemo(() => {
    if (!titlesData) return [];
    const types = new Set(titlesData.map((t) => t.type).filter(Boolean));
    return Array.from(types);
  }, [titlesData]);

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-slate-700">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C341F6] to-[#8E37EB] flex items-center justify-center text-white shadow-sm">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              AI Blog Title Generator
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Generate magnetic, high-CTR blog headlines scored for SEO and click potential
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
            <Wand2 className="w-4 h-4 text-[#8E37EB]" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Headline Preferences
            </h2>
          </div>

          {/* Keyword / Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Focus Keyword or Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Next.js 15, remote team productivity..."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:border-[#8E37EB] focus:ring-2 focus:ring-[#8E37EB]/10 outline-none transition"
              required
            />

            {/* Suggestions */}
            <div className="mt-2 space-y-1">
              <span className="text-[11px] text-gray-400 block font-medium">
                Try these keywords:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptSuggestions.map((sugg) => (
                  <button
                    type="button"
                    key={sugg}
                    onClick={() => setKeyword(sugg)}
                    className="text-[11px] text-gray-500 hover:text-[#8E37EB] bg-gray-50 hover:bg-purple-50/50 p-1 px-2 rounded-md border border-gray-100 transition"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Niche / Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {blogCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-purple-50 text-[#8E37EB] border-purple-200 shadow-2xs font-semibold"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tone & Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Headline Style & Angle
            </label>
            <div className="space-y-1.5">
              {toneStyles.map((tone) => (
                <div
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`p-2 px-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-medium transition ${
                    selectedTone === tone
                      ? "bg-purple-50/70 border-[#8E37EB] text-[#8E37EB] font-semibold shadow-2xs"
                      : "border-gray-200 hover:bg-gray-50 text-slate-600"
                  }`}
                >
                  <span>{tone}</span>
                  {selectedTone === tone && (
                    <span className="w-2 h-2 rounded-full bg-[#8E37EB]"></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition ${
              loading || !keyword.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#C341F6] to-[#8E37EB] hover:opacity-95 shadow-purple-500/20 shadow-md"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Generating High-CTR Titles...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Blog Titles</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Title Cards Output (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[560px]">
          {/* Header & Filter Bar */}
          <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8E37EB]" />
              <h2 className="text-sm font-bold text-slate-800">
                {titlesData ? `Generated Headlines (${filteredTitles.length})` : "Generated Titles"}
              </h2>
            </div>

            {titlesData && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Pills */}
                {uniqueTypes.length > 0 && (
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        filterType === "all"
                          ? "bg-white text-slate-800 shadow-2xs font-semibold"
                          : "text-gray-500 hover:text-slate-800"
                      }`}
                    >
                      All
                    </button>
                    {uniqueTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-2.5 py-1 rounded-md transition ${
                          filterType === type
                            ? "bg-white text-[#8E37EB] shadow-2xs font-semibold"
                            : "text-gray-500 hover:text-slate-800"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 text-xs font-semibold p-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer text-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
                </button>
              </div>
            )}
          </div>

          {/* Titles List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3">
            {!titlesData && !rawMarkdown && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#8E37EB] flex items-center justify-center mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  Ready to discover viral titles?
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Enter your topic, choose your audience niche, and get 10 AI-crafted headlines ranked by CTR and SEO potential.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-[#8E37EB] animate-spin"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Brainstorming viral headlines with AI...
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Analyzing click patterns, search intent, and power words
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Title Cards */}
            {titlesData &&
              !loading &&
              filteredTitles.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopy(t.title, idx)}
                  className="p-4 bg-white hover:bg-slate-50/70 border border-gray-200 hover:border-purple-200 rounded-xl transition shadow-2xs group cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm md:text-base font-bold text-slate-800 group-hover:text-[#8E37EB] transition">
                      {t.title}
                    </h3>

                    <button
                      className={`p-2 rounded-lg border transition shrink-0 ${
                        copiedIndex === idx
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-gray-50 group-hover:bg-purple-50 text-gray-400 group-hover:text-[#8E37EB] border-gray-200"
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
                    {t.score && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-500" />
                        CTR Score: {t.score}/100
                      </span>
                    )}

                    {t.type && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#8E37EB] font-medium border border-purple-100">
                        {t.type}
                      </span>
                    )}

                    <span className="text-gray-400 font-medium">
                      {t.title.length} characters
                    </span>
                  </div>

                  {/* Why it works note */}
                  {t.whyItWorks && (
                    <p className="text-xs text-gray-500 bg-slate-50 p-2 px-3 rounded-lg border border-gray-100 italic">
                      💡 {t.whyItWorks}
                    </p>
                  )}
                </div>
              ))}

            {/* Fallback for raw markdown */}
            {rawMarkdown && !loading && (
              <div className="reset-tw text-sm text-slate-700 p-4">
                <Markdown>{rawMarkdown}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogTitles;