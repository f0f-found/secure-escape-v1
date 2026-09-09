import StatusBadge from "../StatusBadge";
import type { DuressSessionDetail } from "../../types/session";

interface EvidencePanelProps {
  session: DuressSessionDetail;
}

export default function EvidencePanel({
  session,
}: EvidencePanelProps) {
  const isLiveSession = session.status === "Active";

  const sortedLocations = [...session.locations].sort(
    (a, b) =>
      new Date(b.capturedAt).getTime() -
      new Date(a.capturedAt).getTime(),
  );

  const locationHistoryBlock = (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <p className="eyebrow">
            Location evidence
          </p>

          <h2 className="panel-heading">
            {isLiveSession
              ? "Location History"
              : "Recorded Locations"}
          </h2>

          <p className="panel-description">
            Chronological record of GPS positions
            captured during this incident.
          </p>
        </div>

        <span className="panel-count">
          {sortedLocations.length}{" "}
          {sortedLocations.length === 1
            ? "point"
            : "points"}
        </span>
      </div>

      {sortedLocations.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="font-medium text-slate-600">
            No location events recorded
          </p>

          <p className="mt-1 text-sm text-slate-400">
            GPS location evidence is not available for
            this incident.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E5EDF3]">
          {sortedLocations.map(
            (location, index) => (
              <div
                key={location.id}
                className="px-5 py-4 transition-colors hover:bg-[#F8FBFD]"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-[#102A43]">
                        {Number(
                          location.latitude,
                        ).toFixed(6)}
                        ,{" "}
                        {Number(
                          location.longitude,
                        ).toFixed(6)}
                      </p>

                      {index === 0 && (
                        <span className="border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1769AA]">
                          Latest
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                      <span>
                        Accuracy: ±
                        {location.accuracyMeters} m
                      </span>

                      <span>
                        Source:{" "}
                        {location.locationSource}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm font-semibold text-[#102A43]">
                      {new Date(
                        location.capturedAt,
                      ).toLocaleTimeString(
                        "en-ZA",
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        location.capturedAt,
                      ).toLocaleDateString(
                        "en-ZA",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );

  const transactionsBlock = (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <p className="eyebrow">
            Financial evidence
          </p>

          <h2 className="panel-heading">
            Transactions
          </h2>

          <p className="panel-description">
            Transactions captured during this duress
            session.
          </p>
        </div>

        <span className="panel-count">
          {session.transactions.length}{" "}
          {session.transactions.length === 1
            ? "transaction"
            : "transactions"}
        </span>
      </div>

      {session.transactions.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="font-medium text-slate-600">
            No transactions recorded
          </p>

          <p className="mt-1 text-sm text-slate-400">
            No financial activity was captured during
            this incident.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E5EDF3]">
          {session.transactions.map((tx) => (
            <div
              key={tx.id}
              className="px-5 py-5 transition-colors hover:bg-[#F8FBFD]"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                        tx.flagged
                          ? "border border-red-200 bg-red-50 text-red-700"
                          : "border border-green-200 bg-green-50 text-green-700"
                      }`}
                    >
                      {tx.flagged
                        ? "Flagged"
                        : "Clean"}
                    </span>

                    <StatusBadge
                      status={tx.status}
                    />
                  </div>

                  <div className="mt-4">
                    <h3 className="text-2xl font-bold tracking-tight text-[#102A43]">
                      R{" "}
                      {tx.amount.toLocaleString(
                        "en-ZA",
                      )}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {tx.transactionType}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                        Reference
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-slate-800">
                        {tx.bankReference}
                      </p>
                    </div>

                    {tx.secureEscapeCode && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          SecureEscape Code
                        </p>

                        <p className="mt-1 font-mono text-sm font-semibold text-[#1769AA]">
                          {tx.secureEscapeCode}
                        </p>
                      </div>
                    )}

                    {tx.statusReason && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          Reason
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {tx.statusReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 lg:text-right">
                  <p className="text-sm font-semibold text-[#102A43]">
                    {new Date(
                      tx.createdAt,
                    ).toLocaleTimeString(
                      "en-ZA",
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(
                      tx.createdAt,
                    ).toLocaleDateString(
                      "en-ZA",
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {isLiveSession ? (
        <>
          {locationHistoryBlock}
          {transactionsBlock}
        </>
      ) : (
        <>
          {transactionsBlock}
          {locationHistoryBlock}
        </>
      )}
    </div>
  );
}