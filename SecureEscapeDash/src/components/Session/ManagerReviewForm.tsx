import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";

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
  const [submitting, setSubmitting] = useState<
    "Approved" | "Rejected" | null
  >(null);
  const [error, setError] = useState("");

  const handleReview = async (
    status: "Approved" | "Rejected",
  ) => {
    const trimmedNotes = notes.trim();

    // A manager must explain why a report is being returned.
    if (status === "Rejected" && !trimmedNotes) {
      setError(
        "Please explain what the analyst needs to change before returning the report.",
      );
      return;
    }

    try {
      setSubmitting(status);
      setError("");

      const updated = await managerReviewCase(
        session.id,
        status,
        trimmedNotes,
      );

      onReviewed(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit review.",
      );
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <ClipboardCheck
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="eyebrow">
              Manager workflow
            </p>

            <h2 className="panel-heading">
              Case review
            </h2>

            <p className="panel-description">
              Review the analyst&apos;s findings and decide
              whether the case is ready to close.
            </p>
          </div>
        </div>

        <span className="panel-count">
          Pending review
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="border border-[#DCE6EE] bg-[#F8FBFD] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Analyst resolution recommendation
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#102A43]">
            {session.resolutionSummary ||
              "No resolution recommendation was provided."}
          </p>
        </div>

        {session.investigationSummary && (
          <div>
            <p className="text-sm font-semibold text-[#102A43]">
              Investigation summary
            </p>

            <p className="mt-2 whitespace-pre-wrap border-l-2 border-[#1769AA] pl-3 text-sm leading-6 text-slate-600">
              {session.investigationSummary}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="manager-review-notes"
              className="text-sm font-semibold text-[#102A43]"
            >
              Review notes
            </label>

            <span className="text-xs text-slate-400">
              {notes.length}/2000
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Approval notes are optional. A reason is required
            when returning the report for changes.
          </p>

          <textarea
            id="manager-review-notes"
            rows={4}
            maxLength={2000}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="Add review notes or explain what the analyst needs to change..."
            className={`mt-3 w-full resize-none border bg-white px-4 py-3 text-sm leading-6 text-[#102A43] outline-none transition placeholder:text-slate-400 focus:ring-2 ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                : "border-[#CBD9E3] focus:border-[#1769AA] focus:ring-[#1769AA]/10"
            }`}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
          >
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              handleReview("Approved")
            }
            disabled={submitting !== null}
            className="flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={16} />

            {submitting === "Approved"
              ? "Approving..."
              : "Approve and resolve"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleReview("Rejected")
            }
            disabled={submitting !== null}
            className="flex items-center justify-center gap-2 border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={16} />

            {submitting === "Rejected"
              ? "Returning..."
              : "Return for changes"}
          </button>
        </div>

        <div className="border-t border-[#E5EDF3] pt-4">
          <p className="text-xs leading-5 text-slate-500">
            Approving the report closes the case as resolved.
            Returning it sends the case back to the analyst
            for further investigation and resubmission.
          </p>
        </div>
      </div>
    </section>
  );
}