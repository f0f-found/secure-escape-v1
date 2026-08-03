import { useState } from "react";
import type { DuressSessionDetail } from "../../types/session";
import { submitCaseReport } from "../../services/sessionService";

interface CaseReportFormProps {
  session: DuressSessionDetail;
  onSubmitted: (updated: DuressSessionDetail) => void;
}

export default function CaseReportForm({
  session,
  onSubmitted,
}: CaseReportFormProps) {
  const [investigationSummary, setInvestigationSummary] = useState(
    session.investigationSummary || "",
  );
  const [resolutionSummary, setResolutionSummary] = useState(
    session.resolutionSummary || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!resolutionSummary.trim()) {
      setError("Resolution summary is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const updated = await submitCaseReport(
        session.id,
        investigationSummary,
        resolutionSummary,
      );
      onSubmitted(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white   border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Case Report</h2>
        <p className="text-sm text-slate-500 mt-1">
          Submit your investigation findings for manager review.
        </p>
      </div>
      {session.managerReviewStatus === "Rejected" && (
        <div className="mx-6 mt-6   border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">
            Manager requested changes
          </p>
          {session.managerReviewNotes && (
            <p className="mt-1 text-sm text-red-700">
              {session.managerReviewNotes}
            </p>
          )}
        </div>
      )}
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Investigation Summary
          </label>
          <textarea
            rows={4}
            maxLength={2000}
            value={investigationSummary}
            onChange={(e) => setInvestigationSummary(e.target.value)}
            placeholder="What did you find during the investigation?"
            className="mt-2 w-full   border border-slate-300 px-4 py-3 resize-none focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Resolution Summary *
          </label>
          <textarea
            rows={4}
            maxLength={2000}
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            placeholder="How was this case resolved?"
            className="mt-2 w-full   border border-slate-300 px-4 py-3 resize-none focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full   bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Case Report"}
        </button>
      </div>
    </div>
  );
}
