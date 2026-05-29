"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Upload, Trash2, Copy, Check, Loader2, Image as ImageIcon,
  Grid, List, Search, RefreshCw, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

interface Asset {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("bosba");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async (cursor?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ folder });
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/admin/media?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssets((prev) => cursor ? [...prev, ...data.assets] : data.assets);
      setNextCursor(data.nextCursor);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let count = 0;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (res.ok) count++;
      else toast.error(`Failed: ${file.name}`);
    }
    if (count) {
      toast.success(`${count} file${count > 1 ? "s" : ""} uploaded`);
      fetchAssets();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(publicId: string) {
    if (!confirm("Delete this image permanently from Cloudinary?")) return;
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });
    if (res.ok) {
      toast.success("Deleted");
      setAssets((prev) => prev.filter((a) => a.publicId !== publicId));
      if (selectedId === publicId) setSelectedId(null);
    } else {
      toast.error("Delete failed");
    }
  }

  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered = assets.filter(
    (a) => !search || a.publicId.toLowerCase().includes(search.toLowerCase())
  );

  const selected = assets.find((a) => a.publicId === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{assets.length} files · Cloudinary storage</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAssets()}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload Files"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename…"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Folder filter */}
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="bosba">All</option>
              <option value="bosba/products">Products</option>
              <option value="bosba/banners">Banners</option>
              <option value="bosba/media">General</option>
              <option value="bosba/categories">Categories</option>
            </select>

            {/* View toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Upload drop zone (when empty) */}
          {!loading && filtered.length === 0 && (
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-16 flex flex-col items-center gap-4 text-gray-400 cursor-pointer hover:border-red-300 hover:text-red-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-12 w-12" />
              <div className="text-center">
                <p className="font-medium text-base">No media files yet</p>
                <p className="text-sm mt-1">Click to upload your first image</p>
              </div>
            </div>
          )}

          {/* Grid view */}
          {view === "grid" && filtered.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((asset) => (
                <div
                  key={asset.publicId}
                  onClick={() => setSelectedId(asset.publicId === selectedId ? null : asset.publicId)}
                  className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer ring-2 transition-all ${
                    selectedId === asset.publicId ? "ring-red-500" : "ring-transparent hover:ring-gray-300"
                  }`}
                >
                  <Image src={asset.url} alt="" fill className="object-cover" sizes="160px" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyUrl(asset.url, asset.publicId); }}
                      className="flex-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg py-1 text-xs font-medium flex items-center justify-center gap-1 hover:bg-white"
                      title="Copy URL"
                    >
                      {copiedId === asset.publicId ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(asset.publicId); }}
                      className="bg-white/90 backdrop-blur-sm text-red-500 rounded-lg py-1 px-2 text-xs hover:bg-white"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {view === "list" && filtered.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">File</th>
                    <th className="px-4 py-3 text-left">Dimensions</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((asset) => (
                    <tr key={asset.publicId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={asset.url} alt="" width={40} height={40} className="object-cover w-full h-full" />
                          </div>
                          <span className="text-xs font-mono text-gray-600 truncate max-w-[200px]">
                            {asset.publicId.split("/").pop()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{asset.width}×{asset.height}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatBytes(asset.bytes)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => copyUrl(asset.url, asset.publicId)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                            title="Copy URL"
                          >
                            {copiedId === asset.publicId ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <a href={asset.url} target="_blank" rel="noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(asset.publicId)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Load more */}
          {nextCursor && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchAssets(nextCursor)}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </div>

        {/* Right: selected asset detail */}
        {selected && (
          <div className="w-64 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3 sticky top-6">
              <h3 className="font-semibold text-gray-900 text-sm">File Details</h3>
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image src={selected.url} alt="" width={256} height={256} className="object-cover w-full h-full" />
              </div>
              <dl className="space-y-1.5 text-xs">
                <div>
                  <dt className="text-gray-400">Filename</dt>
                  <dd className="font-medium text-gray-700 font-mono truncate">{selected.publicId.split("/").pop()}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Dimensions</dt>
                  <dd className="font-medium text-gray-700">{selected.width} × {selected.height}px</dd>
                </div>
                <div>
                  <dt className="text-gray-400">File size</dt>
                  <dd className="font-medium text-gray-700">{formatBytes(selected.bytes)}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Format</dt>
                  <dd className="font-medium text-gray-700 uppercase">{selected.format}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Uploaded</dt>
                  <dd className="font-medium text-gray-700">{new Date(selected.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
              <button
                onClick={() => copyUrl(selected.url, selected.publicId)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors"
              >
                {copiedId === selected.publicId ? (
                  <><Check className="h-4 w-4" /> Copied!</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy URL</>
                )}
              </button>
              <button
                onClick={() => handleDelete(selected.publicId)}
                className="w-full border border-red-200 text-red-600 text-sm font-medium py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
