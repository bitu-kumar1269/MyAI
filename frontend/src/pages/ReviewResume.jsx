import { useState, useMemo } from "react";
import {
  FileText,
  Sparkles,
  UploadCloud,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// Semi-circular SVG Gauge Component
const ScoreGauge = ({ score = 0 }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 64;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getScoreColor = (val) => {
    if (val >= 80) return "#10B981"; // Emerald
    if (val >= 60) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const getScoreLabel = (val) => {
    if (val >= 80) return "Excellent";
    if (val >= 60) return "Good Potential";
    return "Needs Optimization";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
        <svg
          viewBox="0 0 160 90"
          className="w-full h-full transform -rotate-0"
        >
          {/* Background Track Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Colored Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke={getScoreColor(clampedScore)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Needle indicator dot */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {clampedScore}
            <span className="text-base font-semibold text-gray-400">/100</span>
          </span>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full"
        style={{
          backgroundColor: `${getScoreColor(clampedScore)}18`,
          color: getScoreColor(clampedScore),
        }}
      >
        {getScoreLabel(clampedScore)}
      </span>
    </div>
  );
};

const ReviewResume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("content");
  const [expandedCategories, setExpandedCategories] = useState({
    content: true,
    sections: true,
    "ats-essentials": true,
  });
  const [expandedItems, setExpandedItems] = useState({
    "ats-parse-rate": true,
  });
  const [resumeMode, setResumeMode] = useState("enhancv"); // 'original' | 'enhancv'

  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a valid PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmitHandler = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose a PDF resume to analyze.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", selectedFile);

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        let parsed = null;
        if (data.data) {
          parsed = data.data;
        } else if (typeof data.content === "string") {
          try {
            parsed = JSON.parse(data.content);
          } catch {
            // Raw markdown fallback
            setRawMarkdown(data.content);
          }
        }

        if (parsed && parsed.categories) {
          setReportData(parsed);
          setActiveCategoryId(parsed.categories[0]?.id || "content");
          // Expand the first item of the active category by default
          if (parsed.categories[0]?.items?.[0]?.id) {
            setExpandedItems({
              [parsed.categories[0].items[0].id]: true,
            });
          }
        } else if (!rawMarkdown && data.content) {
          setRawMarkdown(data.content);
        }
        toast.success("Resume analysis complete!");
      } else {
        toast.error(data.message || "Failed to analyze resume.");
      }
    } catch (error) {
      toast.error(error.message || "Error communicating with server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const toggleItemExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const activeCategory = useMemo(() => {
    if (!reportData?.categories) return null;
    return (
      reportData.categories.find((c) => c.id === activeCategoryId) ||
      reportData.categories[0]
    );
  }, [reportData, activeCategoryId]);

  const totalIssuesCount = useMemo(() => {
    if (!reportData?.categories) return 0;
    return reportData.categories.reduce((acc, cat) => {
      const catIssues = (cat.items || []).filter(
        (it) => it.status === "issue" || it.status === "warning"
      ).length;
      return acc + catIssues;
    }, 0);
  }, [reportData]);

  // Reset to upload screen
  const handleReset = () => {
    setReportData(null);
    setRawMarkdown("");
    setSelectedFile(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] p-4 md:p-8 text-slate-700">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00DA83] to-[#009BB3] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              ATS Resume Reviewer
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Scan your resume against modern Applicant Tracking Systems to maximize interview calls
            </p>
          </div>
        </div>

        {(reportData || rawMarkdown) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:text-slate-900 px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            Scan Another Resume
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto mt-6">
        {/* Loading Overlay */}
        {loading && (
          <div className="p-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-[#00DA83] animate-spin"></div>
              <Sparkles className="w-6 h-6 text-[#00DA83] absolute inset-0 m-auto animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Auditing Your Resume with AI...
            </h2>
            <p className="text-sm text-gray-500 max-w-md mt-1">
              Extracting text, running ATS keyword checks, evaluating quantifiable impact, and checking readability.
            </p>
          </div>
        )}

        {/* Upload View when no report loaded */}
        {!loading && !reportData && !rawMarkdown && (
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={onSubmitHandler}
              className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm text-center"
            >
              <div className="border-2 border-dashed border-gray-200 hover:border-[#00DA83] transition rounded-2xl p-8 cursor-pointer bg-slate-50/50">
                <input
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00DA83] flex items-center justify-center mb-3">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <span className="text-base font-semibold text-slate-800">
                    {selectedFile ? selectedFile.name : "Choose a PDF Resume"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze`
                      : "Drag & drop or click to browse (PDF only, up to 5MB)"}
                  </span>
                </label>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-left bg-gray-50/70 p-4 rounded-xl border border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ATS Parse Rate Check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Impact & Metric Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Format & Headings Audit</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedFile}
                className={`w-full mt-6 py-3 px-6 rounded-xl font-semibold text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedFile
                    ? "bg-gradient-to-r from-[#00DA83] to-[#009BB3] hover:opacity-95"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Analyze Resume
              </button>
            </form>
          </div>
        )}

        {/* Full ATS Report Dashboard matching Reference Design */}
        {!loading && reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar: Score & Category Navigation (4 cols on lg) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-6 lg:sticky lg:top-4">
              {/* Score Header */}
              <div className="text-center pt-2">
                <h2 className="text-lg font-bold text-slate-800">Your Score</h2>
                <div className="mt-3">
                  <ScoreGauge score={reportData.overallScore ?? 75} />
                </div>
              </div>

              {/* Action Banner */}
              <button
                onClick={() => toast.success("You are viewing the comprehensive AI analysis report!")}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] hover:opacity-95 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm text-sm transition"
              >
                <span>Full Audit Report</span>
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Categories Navigation */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                {reportData.categories?.map((cat) => {
                  const isExpanded = expandedCategories[cat.id];
                  const isActive = activeCategoryId === cat.id;

                  return (
                    <div key={cat.id} className="rounded-xl overflow-hidden border border-gray-100">
                      {/* Category Header Row */}
                      <button
                        onClick={() => {
                          setActiveCategoryId(cat.id);
                          toggleCategoryExpand(cat.id);
                        }}
                        className={`w-full flex items-center justify-between p-3 text-left transition cursor-pointer ${
                          isActive
                            ? "bg-slate-50 font-bold text-slate-800"
                            : "hover:bg-gray-50 text-slate-600 font-semibold"
                        }`}
                      >
                        <span className="text-xs uppercase tracking-wider">
                          {cat.name}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              cat.score >= 80
                                ? "bg-emerald-50 text-emerald-700"
                                : cat.score >= 60
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {cat.score}%
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Sub-items List */}
                      {isExpanded && (
                        <div className="bg-white divide-y divide-gray-50 border-t border-gray-100">
                          {cat.items?.map((item) => {
                            const isItemPass = item.status === "pass";
                            const isItemWarning = item.status === "warning";

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setActiveCategoryId(cat.id);
                                  toggleItemExpand(item.id);
                                }}
                                className={`p-2.5 px-3 flex items-center justify-between text-xs cursor-pointer transition hover:bg-slate-50/70 ${
                                  expandedItems[item.id] && isActive
                                    ? "bg-slate-50/80"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  {isItemPass ? (
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : isItemWarning ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-500 shrink-0" />
                                  )}
                                  <span className="truncate text-slate-700 font-medium">
                                    {item.name}
                                  </span>
                                </div>

                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                    isItemPass
                                      ? "bg-emerald-50 text-emerald-700"
                                      : isItemWarning
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {isItemPass
                                    ? "No issues"
                                    : isItemWarning
                                    ? "Notice"
                                    : `${item.issueCount || 1} issue`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total issues badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Overall Diagnostics</span>
                <span className="font-semibold text-slate-700">
                  {totalIssuesCount === 0
                    ? "All checks passed!"
                    : `${totalIssuesCount} item${totalIssuesCount > 1 ? "s" : ""} to polish`}
                </span>
              </div>
            </div>

            {/* Right Main Content: Category Details & Audit Cards (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Category Header Card */}
              {activeCategory && (
                <div className="bg-[#EEF2F6]/60 p-4 px-6 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-wide uppercase">
                      {activeCategory.name}
                    </h2>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-slate-700 shadow-2xs border border-gray-200">
                    {activeCategory.items?.filter(
                      (i) => i.status === "issue" || i.status === "warning"
                    ).length || 0}{" "}
                    issue found
                  </span>
                </div>
              )}

              {/* Items List in Active Category */}
              <div className="space-y-4">
                {activeCategory?.items?.map((item, idx) => {
                  const isExpanded = expandedItems[item.id] ?? false;
                  const isParseRateItem =
                    item.id === "ats-parse-rate" ||
                    item.name.toLowerCase().includes("parse rate");

                  const readRate = item.readRate ?? reportData.atsParseRate ?? 86;
                  const missedRate = item.missedRate ?? reportData.atsMissedRate ?? 14;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition"
                    >
                      {/* Item Accordion Header */}
                      <button
                        onClick={() => toggleItemExpand(item.id)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-4 rounded-full bg-indigo-500"></span>
                          <h3 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-wide">
                            {idx}. {item.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              item.status === "pass"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.status === "warning"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.status === "pass"
                              ? "Pass"
                              : item.status === "warning"
                              ? "Review"
                              : "Action Required"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Item Body */}
                      {isExpanded && (
                        <div className="p-5 pt-0 border-t border-gray-100 space-y-5 text-sm text-slate-600">
                          {/* Description */}
                          <p className="mt-3 text-slate-700 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Visual Parse Rate Bar (matching reference screenshot) */}
                          {isParseRateItem && (
                            <div className="p-6 bg-slate-50/70 rounded-xl border border-gray-200/80 space-y-5">
                              {/* Gauge Progress Bar */}
                              <div>
                                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                                  <span className="text-emerald-700 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {readRate}% read by the ATS
                                  </span>
                                  <span className="text-red-500 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                    {missedRate}% missed
                                  </span>
                                </div>

                                {/* Stacked Progress Bar */}
                                <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-200">
                                  <div
                                    style={{ width: `${readRate}%` }}
                                    className="bg-gradient-to-r from-emerald-400 to-[#00DA83] h-full transition-all duration-700"
                                  ></div>
                                  <div
                                    style={{ width: `${missedRate}%` }}
                                    className="h-full bg-[repeating-linear-gradient(45deg,#FCA5A5,#FCA5A5_8px,#EF4444_8px,#EF4444_16px)] opacity-90 transition-all duration-700"
                                  ></div>
                                </div>
                              </div>

                              {/* Bold takeaway callout */}
                              <div className="text-center py-2">
                                <h4 className="text-base md:text-lg font-extrabold text-slate-800 leading-snug">
                                  {item.callout ||
                                    `The missing ${missedRate}% of your resume isn't your experience — it's your template.`}
                                </h4>
                              </div>

                              {/* "Your resume, two ways" toggle box */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                    <FileText className="w-4 h-4 text-slate-600" />
                                    <span>Your resume, two ways</span>
                                  </div>

                                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                                    <button
                                      onClick={() => setResumeMode("original")}
                                      className={`px-3 py-1 rounded-md transition ${
                                        resumeMode === "original"
                                          ? "bg-white text-slate-800 shadow-2xs font-semibold"
                                          : "text-gray-500 hover:text-slate-800"
                                      }`}
                                    >
                                      Original
                                    </button>
                                    <button
                                      onClick={() => setResumeMode("enhancv")}
                                      className={`px-3 py-1 rounded-md transition ${
                                        resumeMode === "enhancv"
                                          ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                                          : "text-gray-500 hover:text-slate-800"
                                      }`}
                                    >
                                      ATS Optimized
                                    </button>
                                  </div>
                                </div>

                                <div className="p-3 bg-emerald-50/60 rounded-lg text-xs font-medium text-emerald-800 flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>ATS-tested single column layout • built to parse cleanly</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Specific Findings */}
                          {item.findings && (
                            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/60">
                              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                What We Detected
                              </h4>
                              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                {item.findings}
                              </p>
                            </div>
                          )}

                          {/* Recommendation */}
                          {item.recommendation && (
                            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/60">
                              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Actionable Recommendation
                              </h4>
                              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                {item.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Immediate Action Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Strengths */}
                {reportData.strengths && reportData.strengths.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" />
                      Top Strengths
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {reportData.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Priority Fixes */}
                {reportData.topFixes && reportData.topFixes.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-indigo-500" />
                      Priority Fixes
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {reportData.topFixes.map((fix, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback for raw markdown text if older analysis */}
        {!loading && !reportData && rawMarkdown && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Analysis Results
            </h2>
            <div className="reset-tw text-sm text-slate-700">
              <Markdown>{rawMarkdown}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;