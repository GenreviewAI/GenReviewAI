"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import Link from "next/link";

function SentimentPill({ sentiment }: { sentiment?: string }) {
  const s = (sentiment || "").toLowerCase();
  const styles =
    s === "positive"
      ? "bg-sage/10 text-sage-dark border-sage/30"
      : s === "negative"
      ? "bg-plum/10 text-plum-dark border-plum/30"
      : "bg-amber/10 text-amber-dark border-amber/30";
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${styles}`}
    >
      {sentiment || "unrated"}
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState<string>("");
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Owner Dashboard | GenReviewAI";
    const rid = localStorage.getItem("gr_restaurant_id");
    const oname = localStorage.getItem("gr_owner_name") || "";
    const rname = localStorage.getItem("gr_restaurant_name") || "";
    setOwnerName(oname);
    setRestaurantName(rname);
    setRestaurantId(rid);

    if (!rid) {
      setError("No restaurant found. Please configure your restaurant in Settings.");
      setLoading(false);
      return;
    }

    api
      .getDashboard(rid)
      .then((res) => setData(res as DashboardResponse))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Live feed"
        title="Dashboard"
        description={
          restaurantName
            ? `${restaurantName} — every rating sorted and summarized in real time.`
            : "Every rating that comes through your QR code, sorted and summarized in real time."
        }
      />

      {ownerName && (
        <div className="px-8 pt-4 pb-0">
          <p className="text-sm text-ink-soft">
            Welcome back, <span className="font-semibold text-ink">{ownerName}</span>
          </p>
        </div>
      )}

      <div className="px-8 py-8">
        {loading && (
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
            Loading metrics…
          </p>
        )}

        {error && !loading && (
          <div className="border border-plum/30 bg-plum/5 px-5 py-4 text-sm text-plum-dark space-y-3">
            <p>{error}</p>
            {!restaurantId && (
              <Link
                href="/settings"
                className="inline-block bg-paprika px-4 py-2 text-xs font-medium text-paper hover:bg-paprika-dark transition-colors"
              >
                Set up your restaurant →
              </Link>
            )}
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <MetricCard label="Total reviews" value={data.metrics.total_reviews} />
              <MetricCard
                label="Average rating"
                value={data.metrics.average_rating.toFixed(1)}
                suffix="/ 5"
                tone="amber"
              />
              <MetricCard
                label="Positive"
                value={data.metrics.positive_reviews}
                tone="sage"
              />
              <MetricCard
                label="Negative"
                value={data.metrics.negative_reviews}
                tone="plum"
              />
              <MetricCard label="Neutral" value={data.metrics.neutral_reviews} />
            </div>

            <div className="mt-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Recent tickets
              </p>
              <div className="mt-3 divide-y divide-line border border-line bg-paper">
                {data.recent_reviews.length === 0 && (
                  <p className="px-5 py-6 text-sm text-ink-faint">
                    No reviews yet — once your QR code gets scanned, they'll print here.
                  </p>
                )}
                {data.recent_reviews.map((r, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-ink flex items-center gap-2 flex-wrap">
                        <span>{r.customer_name || "Anonymous guest"}</span>
                        <span className="font-mono text-xs text-ink-faint">
                          · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                        </span>
                        {r.is_private ? (
                          <span className="rounded bg-plum/10 border border-plum/30 text-plum-dark text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-mono">
                            Private Feedback
                          </span>
                        ) : (
                          <span className="rounded bg-sage/10 border border-sage/30 text-sage-dark text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-mono">
                            Public Google Review
                          </span>
                        )}
                      </p>
                      {r.review_text && (
                        <p className="mt-1 max-w-lg text-sm text-ink-soft">
                          {r.review_text}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-ink-faint font-mono">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                      </p>
                      {r.ai_recovery && (
                        <div className="mt-4 border border-sage/30 bg-sage-light/5 p-4 rounded-sm max-w-2xl text-left">
                          <p className="text-[10px] font-semibold text-sage-dark flex items-center gap-1.5 font-mono uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                            AI Detractor Recovery Plan
                          </p>
                          <div className="mt-2.5 space-y-2 text-xs">
                            <div>
                              <span className="font-semibold text-ink-soft block">Suggested Apology Response:</span>
                              <p className="mt-1 text-ink italic leading-relaxed">"{r.ai_recovery.apology_draft}"</p>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(r.ai_recovery?.apology_draft || "");
                                  alert("Apology draft copied to clipboard!");
                                }}
                                className="mt-1 text-[10px] text-paprika hover:underline outline-none"
                              >
                                Copy Apology Draft
                              </button>
                            </div>
                            <div className="pt-2 border-t border-line/40">
                              <span className="font-semibold text-ink-soft block">Operational Action Item:</span>
                              <p className="mt-1 text-ink-soft leading-relaxed">{r.ai_recovery.action_item}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <SentimentPill sentiment={r.sentiment} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
