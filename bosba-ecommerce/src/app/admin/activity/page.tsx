"use client";
import { useState, useEffect } from "react";
import { Activity, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  before: string | null;
  after: string | null;
  ip: string | null;
  createdAt: string;
  admin: { name: string | null; email: string };
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN:  "bg-gray-100 text-gray-700",
  EXPORT: "bg-purple-100 text-purple-700",
};

const RESOURCES = ["", "product", "order", "coupon", "category", "banner", "user", "settings"];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [resource, setResource] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(p = page, r = resource) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (r) params.set("resource", r);
    const res = await fetch(`/api/admin/activity?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setPages(data.pages);
      setTotal(data.total);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  function handleResourceChange(r: string) {
    setResource(r);
    setPage(1);
    load(1, r);
  }

  function handlePage(p: number) {
    setPage(p);
    load(p, resource);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total entries</p>
        </div>
        <select
          value={resource}
          onChange={(e) => handleResourceChange(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {RESOURCES.map((r) => (
            <option key={r} value={r}>{r || "All resources"}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
            <Activity className="h-8 w-8" />
            <p>No activity logged yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id}>
                <button
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Action badge */}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                    {log.action}
                  </span>

                  {/* Resource */}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0 capitalize">
                    {log.resource}
                  </span>

                  {/* Resource ID */}
                  {log.resourceId && (
                    <span className="text-xs font-mono text-gray-400 flex-shrink-0 hidden sm:block">
                      #{log.resourceId.slice(0, 8)}
                    </span>
                  )}

                  {/* Admin */}
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {log.admin.name ?? log.admin.email}
                  </span>

                  {/* IP */}
                  {log.ip && (
                    <span className="text-xs text-gray-400 hidden md:block flex-shrink-0">{log.ip}</span>
                  )}

                  {/* Time */}
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </button>

                {/* Expanded diff */}
                {expanded === log.id && (log.before || log.after) && (
                  <div className="px-5 pb-4 grid sm:grid-cols-2 gap-3">
                    {log.before && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Before</p>
                        <pre className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 overflow-auto max-h-32 font-mono">
                          {JSON.stringify(JSON.parse(log.before), null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.after && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">After</p>
                        <pre className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 overflow-auto max-h-32 font-mono">
                          {JSON.stringify(JSON.parse(log.after), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => handlePage(page - 1)}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              disabled={page >= pages}
              onClick={() => handlePage(page + 1)}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
