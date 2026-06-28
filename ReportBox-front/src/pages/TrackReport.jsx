import { useState } from "react";
import {
  Search,
  Loader,
  AlertCircle,
  Clock,
  CheckCircle,
  RefreshCw,
  MapPin,
} from "lucide-react";

const STATUS_META = {
  pending: {
    label: "Pending",
    color: "text-amber-300",
    bg: "bg-amber-500/15 border-amber-500/30",
    dot: "bg-amber-300",
    Icon: Clock,
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-300",
    bg: "bg-blue-500/15 border-blue-500/30",
    dot: "bg-blue-300",
    Icon: RefreshCw,
  },
  resolved: {
    label: "Resolved",
    color: "text-green-300",
    bg: "bg-green-500/15 border-green-500/30",
    dot: "bg-green-300",
    Icon: CheckCircle,
  },
};

function TrackReport() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [trackingId, setTrackingId] = useState("");
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e?.preventDefault();
    const id = trackingId.trim();
    if (!id) return;

    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch(
        `${BASE_URL}/api/ReportForm/track/${encodeURIComponent(id)}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Report not found.");
      }
      setReport(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";

  const current = report ? STATUS_META[report.status] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Search className="w-7 h-7 text-blue-400" />
          Track Your Report
        </h1>
        <p className="text-slate-400 mb-6">
          Enter the tracking ID you received when you submitted your report
          (e.g. <span className="font-mono text-slate-300">SVK-XXXXXXXXXX</span>).
        </p>

        <form onSubmit={handleTrack} className="flex gap-3 mb-6">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter tracking ID"
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase"
          />
          <button
            type="submit"
            disabled={isLoading || !trackingId.trim()}
            className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
              isLoading || !trackingId.trim()
                ? "bg-slate-600/50 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
            }`}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Track
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {report && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold">{report.title}</h2>
                <p className="text-sm text-slate-400">{report.category}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  {report.trackingId}
                </p>
              </div>
              {current && (
                <span
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${current.bg} ${current.color}`}
                >
                  <current.Icon className="w-4 h-4" />
                  {current.label}
                </span>
              )}
            </div>

            {report.location && (
              <p className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <MapPin className="w-4 h-4" /> {report.location}
              </p>
            )}
            <p className="text-xs text-slate-500 mb-6">
              Submitted {formatDate(report.createdAt)}
            </p>

            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              Status timeline
            </h3>
            <ol className="relative border-l border-white/15 ml-2">
              {(report.statusHistory || []).map((entry, i) => {
                const meta = STATUS_META[entry.status] || STATUS_META.pending;
                return (
                  <li key={i} className="mb-5 ml-4">
                    <span
                      className={`absolute -left-[7px] w-3 h-3 rounded-full ${meta.dot}`}
                    />
                    <p className={`text-sm font-medium ${meta.color}`}>
                      {meta.label}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-slate-400">{entry.note}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      {formatDate(entry.changedAt)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackReport;
