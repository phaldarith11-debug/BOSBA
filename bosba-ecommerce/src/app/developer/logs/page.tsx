import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getLogs() {
  try {
    return await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function DeveloperLogsPage() {
  const logs = await getLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs &amp; Errors</h1>
        <p className="text-sm text-gray-500 mt-1">
          Most recent {logs.length} audit entries. Error-log capture is added in Milestone 5.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Time</th>
              <th className="px-5 py-3 text-left">Action</th>
              <th className="px-5 py-3 text-left">Resource</th>
              <th className="px-5 py-3 text-left">Actor</th>
              <th className="px-5 py-3 text-left">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {log.resource}
                  {log.resourceId && <span className="text-gray-400"> · {log.resourceId}</span>}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs font-mono">{log.adminId}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{log.ip ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  No audit entries recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
