"use client";

/**
 * Last-resort error boundary. Unlike per-segment error.tsx, this also catches
 * errors thrown inside the root/segment LAYOUTS (e.g. a failed getServerSession
 * in /admin, /seller, /developer layouts) — which is exactly what produced the
 * bare "Application error" screen. It must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
            background: "#f9fafb",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: 16, background: "#fef3c7",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20, fontSize: 28,
            }}
          >
            ⚠️
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, maxWidth: 420, fontSize: 14, color: "#6b7280" }}>
            The page couldn&apos;t load. This is usually temporary or a server
            configuration issue. Please try again.
          </p>
          {error?.digest && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
              Reference: <span style={{ fontFamily: "monospace" }}>{error.digest}</span>
            </p>
          )}
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button
              onClick={reset}
              style={{
                background: "#0f172a", color: "#fff", border: 0, borderRadius: 12,
                padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #e5e7eb", borderRadius: 12, padding: "8px 16px",
                fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none",
              }}
            >
              Go to store
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
