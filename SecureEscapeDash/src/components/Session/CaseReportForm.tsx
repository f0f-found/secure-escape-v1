import { useState } from "react";
import {
  AlertCircle,
  ClipboardCheck,
  FileText,
  Send,
} from "lucide-react";

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
  const [investigationSummary, setInvestigationSummary] =
    useState(session.investigationSummary || "");

  const [resolutionSummary, setResolutionSummary] =
    useState(session.resolutionSummary || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!resolutionSummary.trim()) {
      setError("Resolution recommendation is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const updated = await submitCaseReport(
        session.id,
        investigationSummary.trim(),
        resolutionSummary.trim(),
      );

      onSubmitted(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit report.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const wasRejected =
    session.managerReviewStatus === "Rejected";

  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <FileText size={18} strokeWidth={1.8} />
          </div>

          <div>
            <p className="eyebrow">
              Analyst workflow
            </p>

            <h2 className="panel-heading">
              Case report
            </h2>

            <p className="panel-description">
              Submit your investigation findings and
              resolution recommendation for manager review.
            </p>
          </div>
        </div>
      </div>

      {wasRejected && (
        <div className="mx-5 mt-5 border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Report returned for changes
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                The manager did not approve the previous
                submission. Review the feedback below,
                update your findings and resubmit the report.
              </p>

              {session.managerReviewNotes && (
                <div className="mt-3 border-l-2 border-red-300 pl-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-red-500">
                    Manager feedback
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-800">
                    {session.managerReviewNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5 p-5">
        <div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-[#102A43]">
              Investigation summary
            </label>

            <span className="text-xs text-slate-400">
              {investigationSummary.length}/2000
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Summarise the alerts, transactions, location
            evidence and other findings you reviewed.
          </p>

          <textarea
            rows={5}
            maxLength={2000}
            value={investigationSummary}
            onChange={(e) => {
              setInvestigationSummary(
                e.target.value,
              );

              if (error) {
                setError("");
              }
            }}
            placeholder="Describe what you found during the investigation..."
            className="mt-3 w-full resize-none border border-[#CBD9E3] bg-white px-4 py-3 text-sm leading-6 text-[#102A43] outline-none transition placeholder:text-slate-400 focus:border-[#1769AA] focus:ring-2 focus:ring-[#1769AA]/10"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-[#102A43]">
              Resolution recommendation
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <span className="text-xs text-slate-400">
              {resolutionSummary.length}/2000
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Explain your recommended outcome and why the
            case is ready for manager review.
          </p>

          <textarea
            rows={5}
            maxLength={2000}
            value={resolutionSummary}
            onChange={(e) => {
              setResolutionSummary(
                e.target.value,
              );

              if (error) {
                setError("");
              }
            }}
            placeholder="Provide your recommended resolution..."
            className="mt-3 w-full resize-none border border-[#CBD9E3] bg-white px-4 py-3 text-sm leading-6 text-[#102A43] outline-none transition placeholder:text-slate-400 focus:border-[#1769AA] focus:ring-2 focus:ring-[#1769AA]/10"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="border border-[#DCE6EE] bg-[#F8FBFD] p-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck
              size={17}
              className="mt-0.5 shrink-0 text-[#1769AA]"
            />

            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                What happens next?
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Submitting this report sends the case for
                manager review. The case is not resolved
                until the manager approves the submission.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            submitting || !resolutionSummary.trim()
          }
          className="flex w-full items-center justify-center gap-2 border border-[#1769AA] bg-[#1769AA] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12558A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} />

          {submitting
            ? "Submitting report..."
            : wasRejected
              ? "Resubmit for manager review"
              : "Submit for manager review"}
        </button>
      </div>
    </section>
  );
}