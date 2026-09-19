import { useEffect, useState, useMemo } from "react";
import { dummyCreationData } from "../assets/assets";
import {
  Gem,
  Sparkles,
  SquarePen,
  Hash,
  Image as ImageIcon,
  FileText,
  Search,
  RotateCcw,
  Plus,
  Zap,
} from "lucide-react";
import { Protect, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreationItem from "../components/CreationItem";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const filterOptions = [
  { id: "all", label: "All Creations" },
  { id: "article", label: "Articles" },
  { id: "blog-title", label: "Blog Titles" },
  { id: "image", label: "AI Images" },
  { id: "resume-review", label: "Resume Audits" },
];

const quickTools = [
  {
    title: "Article Writer",
    desc: "Long-form SEO content",
    path: "/ai/write-article",
    color: "from-[#3588F2] to-[#0BB0D7]",
    icon: SquarePen,
  },
  {
    title: "Blog Titles",
    desc: "High-CTR viral headlines",
    path: "/ai/blog-titles",
    color: "from-[#B153EA] to-[#E549A3]",
    icon: Hash,
  },
  {
    title: "AI Images",
    desc: "Text to visual art",
    path: "/ai/generate-images",
    color: "from-[#20C363] to-[#11B97E]",
    icon: ImageIcon,
  },
  {
    title: "Resume Reviewer",
    desc: "ATS score diagnostics",
    path: "/ai/review-resume",
    color: "from-[#00DA83] to-[#009BB3]",
    icon: FileText,
  },
];

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { getToken } = useAuth();
  const navigate = useNavigate();

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && Array.isArray(data.creations) && data.creations.length > 0) {
        setCreations(data.creations);
      } else {
        // Fallback to initial dummy data if new account
        setCreations(dummyCreationData);
      }
    } catch {
      setCreations(dummyCreationData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreations();
  }, []);

  // Compute Stats
  const stats = useMemo(() => {
    const total = creations.length;
    const articles = creations.filter((c) => c.type === "article").length;
    const titles = creations.filter((c) => c.type === "blog-title").length;
    const images = creations.filter((c) => c.type === "image").length;
    const resumes = creations.filter((c) => c.type === "resume-review").length;
    return { total, articles, titles, images, resumes };
  }, [creations]);

  // Filtered Creations
  const filteredCreations = useMemo(() => {
    return creations.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.type === activeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [creations, activeFilter, searchQuery]);

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-slate-700 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            Creative Workspace
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Monitor your AI creations, track usage, and launch specialized generation tools
          </p>
        </div>

        <button
          onClick={fetchCreations}
          className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:text-slate-900 px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
          title="Refresh recent creations"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Sync Activity
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Creations */}
          <div className="p-4 px-5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Creations
              </p>
              <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
                {stats.total}
              </h2>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Articles & Titles */}
          <div className="p-4 px-5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Articles & Titles
              </p>
              <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
                {stats.articles + stats.titles}
              </h2>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B153EA] to-[#E549A3] text-white flex justify-center items-center shadow-sm">
              <SquarePen className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* AI Images */}
          <div className="p-4 px-5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Visual Assets
              </p>
              <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
                {stats.images}
              </h2>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#20C363] to-[#11B97E] text-white flex justify-center items-center shadow-sm">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Active Plan Card */}
          <div className="p-4 px-5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Subscription Plan
              </p>
              <h2 className="text-xl font-extrabold mt-1">
                <Protect
                  plan="premium"
                  fallback={<span className="text-slate-700">Free Tier</span>}
                >
                  <span className="bg-gradient-to-r from-[#FF61C5] to-[#9E53EE] bg-clip-text text-transparent">
                    Premium Pro
                  </span>
                </Protect>
              </h2>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-sm">
              <Gem className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Launch Tools Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Launch Tools
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.title}
                  onClick={() => navigate(tool.path)}
                  className="p-3.5 bg-white hover:bg-slate-50 border border-gray-200 hover:border-blue-300 rounded-xl transition cursor-pointer flex items-center gap-3 shadow-2xs group"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                      {tool.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{tool.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Creations Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Recent Creations ({filteredCreations.length})
              </h2>
              <p className="text-xs text-gray-400">
                Browse, search, or review your historical generations
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className="p-2 pl-9 text-xs rounded-xl border border-gray-200 focus:border-blue-500 outline-none w-48 transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setActiveFilter(opt.id)}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      activeFilter === opt.id
                        ? "bg-white text-slate-800 shadow-2xs font-bold"
                        : "text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Creations List */}
          <div className="space-y-3">
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin"></div>
                <p className="text-xs text-gray-400">Loading your creative history...</p>
              </div>
            )}

            {!loading && filteredCreations.length === 0 && (
              <div className="py-16 text-center text-gray-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No creations found</p>
                <p className="text-xs text-gray-400">
                  {searchQuery
                    ? `No creations matched "${searchQuery}"`
                    : "You haven't created anything in this category yet"}
                </p>
              </div>
            )}

            {!loading &&
              filteredCreations.map((item) => (
                <CreationItem key={item.id} item={item} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
