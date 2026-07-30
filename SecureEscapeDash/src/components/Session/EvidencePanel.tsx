import StatusBadge from "../StatusBadge";
import SessionMap from "../SessionMap";
import type { DuressSessionDetail } from "../../types/session";

interface EvidencePanelProps {
  session: DuressSessionDetail;
}

export default function EvidencePanel({ session }: EvidencePanelProps) {
  const isLiveSession = session.status === "Active";

  const mapBlock =
    session.locations.length > 0 ? (
      <div
        className={`bg-white   border shadow-sm overflow-hidden ${
          isLiveSession ? "border-red-200" : "border-slate-200"
        }`}
      >
        <div
          className={`p-6 border-b ${
            isLiveSession ? "border-red-100 bg-red-50" : "border-slate-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold ${
              isLiveSession ? "text-red-900" : "text-slate-900"
            }`}
          >
            {isLiveSession ? "Live Location Tracking" : "Location Map"}
          </h2>

          <p
            className={`text-sm mt-1 ${
              isLiveSession ? "text-red-700" : "text-slate-500"
            }`}
          >
            {isLiveSession
              ? "Latest GPS points captured during the active duress session."
              : "GPS locations captured during the session."}
          </p>
        </div>

        <SessionMap locations={session.locations} />
      </div>
    ) : null;

  const locationHistoryBlock = (
    <div className="bg-white   border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isLiveSession ? "Live Location History" : "Location History"}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Chronological record of captured locations.
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {session.locations.length} Point
          {session.locations.length !== 1 && "s"}
        </span>
      </div>

      {session.locations.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No location events were recorded.
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {session.locations.map((location) => (
            <div
              key={location.id}
              className="p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-slate-900">
                    {location.latitude}, {location.longitude}
                  </p>

                  <div className="flex gap-6 mt-2 text-sm text-slate-600">
                    <span>Accuracy: ±{location.accuracyMeters}m</span>
                    <span>Source: {location.locationSource}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(location.capturedAt).toLocaleTimeString()}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(location.capturedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const transactionsBlock = (
    <div className="bg-white   border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>

          <p className="text-sm text-slate-500 mt-1">
            Transactions captured during this session.
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {session.transactions.length} Transaction
          {session.transactions.length !== 1 && "s"}
        </span>
      </div>

      {session.transactions.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No transactions were recorded.
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {session.transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tx.flagged
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {tx.flagged ? "Flagged" : "Clean"}
                    </span>

                    <StatusBadge status={tx.status} />
                  </div>

                  <h3 className="mt-4 text-2xl font-bold text-slate-900">
                    R {tx.amount.toLocaleString()}
                  </h3>

                  <p className="text-slate-600 mt-1">{tx.transactionType}</p>

                  <div className="grid grid-cols-2 gap-6 mt-5 text-sm">
                    <div>
                      <p className="text-slate-500">Reference</p>
                      <p className="font-medium text-slate-900 break-all">
                        {tx.bankReference}
                      </p>
                    </div>

                    {tx.secureEscapeCode && (
                      <div>
                        <p className="text-slate-500">SecureEscape Code</p>
                        <p className="font-mono text-indigo-600 font-semibold">
                          {tx.secureEscapeCode}
                        </p>
                      </div>
                    )}

                    {tx.statusReason && (
                      <div className="col-span-2">
                        <p className="text-slate-500">Reason</p>
                        <p className="text-slate-700">{tx.statusReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(tx.createdAt).toLocaleTimeString()}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(tx.createdAt).toLocaleDateString()}
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
          {mapBlock}
          {locationHistoryBlock}
          {transactionsBlock}
        </>
      ) : (
        <>
          {transactionsBlock}
          {mapBlock}
          {locationHistoryBlock}
        </>
      )}
    </div>
  );
}
