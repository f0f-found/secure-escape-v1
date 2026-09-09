import {
  Check,
  ClipboardCheck,
  FileText,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

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

interface StageDefinition {
  key: StageKey;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const STAGES: StageDefinition[] = [
  {
    key: "assignment",
    label: "Assigned",
    description: "Case ownership established",
    icon: <UserRoundCheck size={17} />,
  },
  {
    key: "investigation",
    label: "Investigating",
    description: "Analyst reviewing incident",
    icon: <Search size={17} />,
  },
  {
    key: "report",
    label: "Report Submitted",
    description: "Findings submitted",
    icon: <FileText size={17} />,
  },
  {
    key: "review",
    label: "Review",
    description: "Awaiting manager decision",
    icon: <ClipboardCheck size={17} />,
  },
  {
    key: "resolved",
    label: "Resolved",
    description: "Case formally closed",
    icon: <ShieldCheck size={17} />,
  },
];

function getCurrentStage(
  session: DuressSessionDetail,
): StageKey {
  if (!session.assignedAdminUserId) {
    return "assignment";
  }

  if (session.managerReviewStatus === "Rejected") {
    return "investigation";
  }

  if (session.managerReviewStatus === "Approved") {
    return "resolved";
  }

  if (session.managerReviewStatus === "PendingReview") {
    return "review";
  }

  if (session.resolutionSubmittedAt) {
    return "report";
  }

  return "investigation";
}

export default function CaseStageTracker({
  session,
}: CaseStageTrackerProps) {
  const currentStage = getCurrentStage(session);

  const currentIndex = STAGES.findIndex(
    (stage) => stage.key === currentStage,
  );

  const wasRejected =
    session.managerReviewStatus === "Rejected";

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <p className="eyebrow">
            Case workflow
          </p>

          <h2 className="panel-heading">
            Investigation progress
          </h2>

          <p className="panel-description">
            Track this case from assignment through final
            review and resolution.
          </p>
        </div>

        <span className="panel-count">
          Step {currentIndex + 1} of {STAGES.length}
        </span>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <div className="overflow-x-auto">
          <div className="flex min-w-[780px] items-start">
            {STAGES.map((stage, index) => {
              const isDone = index < currentIndex;
              const isCurrent =
                index === currentIndex;

              return (
                <div
                  key={stage.key}
                  className="flex flex-1 items-start last:flex-none"
                >
                  <div className="flex w-[130px] shrink-0 flex-col items-center text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center border transition ${
                        isDone
                          ? "border-[#1769AA] bg-[#1769AA] text-white"
                          : isCurrent
                            ? "border-[#1769AA] bg-[#EAF4FB] text-[#1769AA]"
                            : "border-[#D9E3EA] bg-[#F7FAFC] text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <Check
                          size={18}
                          strokeWidth={2.5}
                        />
                      ) : (
                        stage.icon
                      )}
                    </div>

                    <p
                      className={`mt-3 text-xs font-bold ${
                        isCurrent
                          ? "text-[#1769AA]"
                          : isDone
                            ? "text-[#102A43]"
                            : "text-slate-400"
                      }`}
                    >
                      {stage.label}
                    </p>

                    <p
                      className={`mt-1 max-w-[120px] text-[10px] leading-4 ${
                        isCurrent
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {stage.description}
                    </p>
                  </div>

                  {index <
                    STAGES.length - 1 && (
                    <div className="mt-5 flex flex-1 items-center px-2">
                      <div
                        className={`h-[2px] w-full ${
                          isDone
                            ? "bg-[#1769AA]"
                            : "bg-[#DCE5EC]"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {wasRejected && (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-sm font-semibold text-red-800">
              Report returned for further investigation
            </p>

            <p className="mt-1 text-sm text-red-700">
              The previous report was not approved. The
              case has returned to the investigation stage
              and requires analyst follow-up.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
