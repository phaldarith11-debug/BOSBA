"use client";
import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  titleEn: string | null;
  bodyEn: string | null;
  approved: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
  product: { nameEn: string; slug: string };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  async function load(f = filter) {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews?filter=${f}`);
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function approve(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    if (res.ok) { toast.success("Review approved"); setReviews((p) => p.filter((r) => r.id !== id)); }
  }

  async function reject(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: false }),
    });
    if (res.ok) { toast.success("Review rejected"); setReviews((p) => p.filter((r) => r.id !== id)); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); setReviews((p) => p.filter((r) => r.id !== id)); }
  }

  function handleFilter(f: string) {
    setFilter(f);
    load(f);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">Moderate customer reviews before they appear on the store</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "pending",  label: "Pending Approval" },
          { key: "approved", label: "Approved" },
          { key: "all",      label: "All" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === key ? "bg-red-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 flex flex-col items-center gap-3 text-gray-400">
          <Star className="h-10 w-10" />
          <p className="font-medium">No {filter} reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 flex-1 min-w-0">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{review.rating}/5</span>
                  </div>

                  {/* Title */}
                  {review.titleEn && (
                    <p className="font-semibold text-gray-900">{review.titleEn}</p>
                  )}

                  {/* Body */}
                  {review.bodyEn && (
                    <p className="text-sm text-gray-600 line-clamp-3">{review.bodyEn}</p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span>{review.user.name ?? review.user.email}</span>
                    <span>·</span>
                    <Link
                      href={`/products/${review.product.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                    >
                      {review.product.nameEn}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span>·</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    {review.approved && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold">APPROVED</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.approved && (
                    <button
                      onClick={() => approve(review.id)}
                      className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => reject(review.id)}
                      className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Unpublish
                    </button>
                  )}
                  <button
                    onClick={() => remove(review.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
