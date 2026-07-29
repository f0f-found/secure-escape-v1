import { useState } from "react";
import type { DuressSessionDetail } from "../../types/session";
import { managerReviewCase } from "../../services/sessionService";

interface ManagerReviewFormProps {
  session: DuressSessionDetail;
  onReviewed: (updated: DuressSessionDetail) => void;
}

export default function ManagerReviewForm({
  session,
  onReviewed,
}: ManagerReviewFormProps) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState<"Approved" | "Rejected" | null>(
    null,
  );
  const [error, setError] = useState("");

  const handleReview = async (status: "Approved" | "Rejected") => {
    try {
      setSubmitting(status);
      setError("");
      const updated = await managerReviewCase(session.id, status, notes);
      onReviewed(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="bg-white   border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Manager Review</h2>
        <p className="text-sm text-slate-500 mt-1">
          Approve or reject the analyst's resolution report.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Analyst's Resolution Summary
          </p>
          <p className="mt-2 text-slate-900">{session.resolutionSummary}</p>
        </div>

        <textarea
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Review notes (optional)..."
          className="w-full   border border-slate-300 px-4 py-3 resize-none focus:border-indigo-500 focus:outline-none"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => handleReview("Approved")}
            disabled={submitting !== null}
            className="flex-1   bg-green-600 py-3 text-white font-semibold hover:bg-green-500 disabled:opacity-50"
          >
            {submitting === "Approved" ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => handleReview("Rejected")}
            disabled={submitting !== null}
            className="flex-1   bg-red-600 py-3 text-white font-semibold hover:bg-red-500 disabled:opacity-50"
          >
            {submitting === "Rejected" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
