"use client";
import { useEffect, useState } from "react";
import { Loader2, ScrollText } from "lucide-react";

interface LogRow { id: string; level: string; source: string; message: string; createdAt: string }

const LEVEL_COLORS: Record<string, string> = {
  info: "bg-blue-50 text-blue-700",
  warn: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  audit: "bg-indigo-50 text-indigo-700",
};

const FILTERS = ["all", "info", "warn", "error"] as const;

export default function DeveloperLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  useEffect(() => {
    setLoading(true);
    const q = filter === "all" ? "" : `?level=${filter}`;
    fetch(`/api/developer/logs${q}`)
      .then((r) => (r.ok ? r.json() : { logs: [] }))
      .then((d) => setLogs(d.logs))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs &amp; Errors</h1>
          <p className="text-sm text-gray-500 mt-0.5">System events merged with the admin audit trail, newest first.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${filter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400"><ScrollText className="h-10 w-10 mb-3" /><p className="text-sm">No log entries.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr><th className="px-5 py-3 text-left">Time</th><th className="px-5 py-3 text-left">Level</th><th className="px-5 py-3 text-left">Source</th><th className="px-5 py-3 text-left">Message</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[l.level] ?? "bg-gray-100 text-gray-600"}`}>{l.level}</span></td>
                  <td className="px-5 py-3 text-gray-500 text-xs font-mono">{l.source}</td>
                  <td className="px-5 py-3 text-gray-700">{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
