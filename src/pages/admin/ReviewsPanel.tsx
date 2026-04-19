import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Review = {
  id: string;
  guest_name: string;
  rating: number;
  comment: string | null;
  published: boolean | null;
  created_at: string | null;
};

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const togglePublished = async (id: string, current: boolean | null) => {
    setToggling(id);
    await supabase.from("reviews").update({ published: !current }).eq("id", id);
    await fetchReviews();
    setToggling(null);
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    setReviews((r) => r.filter((rev) => rev.id !== id));
  };

  const published = reviews.filter((r) => r.published);
  const unpublished = reviews.filter((r) => !r.published);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-light text-white">Reviews</h2>
          <p className="text-cream/40 text-sm mt-1">
            {published.length} published · {unpublished.length} pending
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-cream/30 text-sm">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`border rounded-2xl p-6 transition-all ${
                review.published
                  ? "bg-white/[0.03] border-white/5"
                  : "bg-yellow-500/5 border-yellow-500/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-white font-semibold">{review.guest_name}</span>
                    <div className="flex text-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? "currentColor" : "none"}
                          className={i < review.rating ? "text-gold" : "text-cream/20"}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                        review.published
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}
                    >
                      {review.published ? "Published" : "Hidden"}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-cream/70 text-sm leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  )}
                  {review.created_at && (
                    <p className="text-cream/30 text-xs mt-2">
                      {format(new Date(review.created_at), "dd MMM yyyy")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublished(review.id, review.published)}
                    disabled={toggling === review.id}
                    className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-xl border transition-all ${
                      review.published
                        ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20"
                        : "text-green-400 border-green-500/20 bg-green-500/10 hover:bg-green-500/20"
                    }`}
                  >
                    {toggling === review.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : review.published ? (
                      <><EyeOff size={12} /> Hide</>
                    ) : (
                      <><Eye size={12} /> Publish</>
                    )}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                  >
                    <Trash2 size={14} />
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
