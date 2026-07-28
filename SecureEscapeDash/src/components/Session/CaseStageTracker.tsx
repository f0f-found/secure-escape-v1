import type { DuressSessionDetail } from "../../types/session";

interface CaseStageTrackerProps {
  session: DuressSessionDetail;
}

type StageKey =
  | "assignment"
  | "investigation"
  | "report"
  | "review"
  | "resolved";

const STAGES: { key: StageKey; label: string }[] = [
  { key: "assignment", label: "Assignment" },
  { key: "investigation", label: "Investigation" },
  { key: "report", label: "Report" },
  { key: "review", label: "Review" },
  { key: "resolved", label: "Resolved" },
];

function getCurrentStage(session: DuressSessionDetail): StageKey {
  if (!session.assignedAdminUserId) return "assignment";
  if (session.managerReviewStatus === "Approved") return "resolved";
  if (session.managerReviewStatus === "PendingReview") return "review";
  if (session.resolutionSubmittedAt) return "report";
  return "investigation";
}

export default function CaseStageTracker({ session }: CaseStageTrackerProps) {
  const currentStage = getCurrentStage(session);
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const wasRejected = session.managerReviewStatus === "Rejected";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center">
        {STAGES.map((stage, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={stage.key}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isDone
                      ? "bg-indigo-600 text-white"
                      : isCurrent
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isCurrent
                      ? "text-indigo-700"
                      : isDone
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {index < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${isDone ? "bg-indigo-600" : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {wasRejected && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">
            Manager rejected the previous report — case returned to
            Investigation.
          </p>
        </div>
      )}
    </div>
  );
}
