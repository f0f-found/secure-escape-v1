import { Fragment, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, MapPinned, RefreshCw } from "lucide-react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import {
  getRiskZones,
  type RiskLevel,
  type RiskZone,
} from "../../services/riskZoneService";

function getRiskStyles(risk: RiskLevel) {
  switch (risk) {
    case "High":
      return {
        stroke: "#dc2626",
        fill: "#ef4444",
        softFill: "#fecaca",
      };

    case "Medium":
      return {
        stroke: "#ea580c",
        fill: "#f97316",
        softFill: "#fed7aa",
      };

    case "Low":
      return {
        stroke: "#2563eb",
        fill: "#3b82f6",
        softFill: "#bfdbfe",
      };
  }
}

function RiskSummary({
  risk,
  label,
  zones,
}: {
  risk: RiskLevel;
  label: string;
  zones: RiskZone[];
}) {
  const count = zones.filter(
    (zone) => zone.riskLevel === risk,
  ).length;

  const styles = getRiskStyles(risk);

  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: styles.fill,
        }}
      />

      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold text-[#102A43]">
        {count}
      </span>
    </div>
  );
}

export default function RiskMap() {
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRiskZones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const zones = await getRiskZones();
      setRiskZones(zones);
    } catch (err) {
      console.error("Failed to load risk zones:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load area risk information.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRiskZones();
  }, []);

  const highRiskCount = useMemo(
    () =>
      riskZones.filter(
        (zone) => zone.riskLevel === "High",
      ).length,
    [riskZones],
  );

  const mediumRiskCount = useMemo(
    () =>
      riskZones.filter(
        (zone) => zone.riskLevel === "Medium",
      ).length,
    [riskZones],
  );

  const lowRiskCount = useMemo(
    () =>
      riskZones.filter(
        (zone) => zone.riskLevel === "Low",
      ).length,
    [riskZones],
  );

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <MapPinned size={18} strokeWidth={1.8} />
          </div>

          <div>
            <p className="eyebrow">
              Geographic intelligence
            </p>

            <h2 className="panel-heading">
              Area risk overview
            </h2>

            <p className="panel-description">
              Security risk distribution across monitored
              areas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadRiskZones()}
          disabled={isLoading}
          className="flex items-center gap-2 border border-[#D8E3EC] bg-white px-3 py-2 text-xs font-semibold text-[#1769AA] transition hover:bg-[#F4F8FB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={isLoading ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 border-b border-[#E5EDF3] bg-[#FBFDFE]">
        <div className="border-r border-[#E5EDF3] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            High risk
          </p>

          <p className="mt-1 text-xl font-semibold text-red-600">
            {highRiskCount}
          </p>
        </div>

        <div className="border-r border-[#E5EDF3] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Medium
          </p>

          <p className="mt-1 text-xl font-semibold text-orange-600">
            {mediumRiskCount}
          </p>
        </div>

        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Low risk
          </p>

          <p className="mt-1 text-xl font-semibold text-blue-600">
            {lowRiskCount}
          </p>
        </div>
      </div>

      {isLoading && riskZones.length === 0 ? (
        <div className="flex h-[380px] items-center justify-center bg-[#F8FBFD]">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2
              size={28}
              className="animate-spin text-[#1769AA]"
            />

            <p className="text-sm font-medium">
              Loading area risk information...
            </p>
          </div>
        </div>
      ) : error && riskZones.length === 0 ? (
        <div className="flex h-[380px] items-center justify-center bg-[#F8FBFD] px-6">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center bg-red-50 text-red-600">
              <AlertCircle size={21} />
            </div>

            <p className="mt-3 text-sm font-semibold text-[#102A43]">
              Area risk information unavailable
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadRiskZones()}
              className="mt-4 border border-[#D8E3EC] bg-white px-4 py-2 text-xs font-semibold text-[#1769AA] transition hover:bg-[#F4F8FB]"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
              <AlertCircle size={14} />

              The latest area risk information could not be
              refreshed. Showing the previously loaded data.
            </div>
          )}

          <div className="relative">
            <div className="risk-map-shell">
              <MapContainer
                center={[-26.2041, 28.0473]}
                zoom={11}
                scrollWheelZoom
                style={{
                  height: "380px",
                  width: "100%",
                }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {riskZones.map((zone) => {
                  const styles = getRiskStyles(
                    zone.riskLevel,
                  );

                  const center: [number, number] = [
                    zone.latitude,
                    zone.longitude,
                  ];

                  return (
                    <Fragment key={zone.id}>
                      <Circle
                        center={center}
                        radius={zone.radiusMeters}
                        pathOptions={{
                          color: styles.stroke,
                          fillColor: styles.softFill,
                          fillOpacity: 0.25,
                          weight: 1.5,
                        }}
                      />

                      <CircleMarker
                        center={center}
                        radius={8}
                        pathOptions={{
                          color: "#ffffff",
                          weight: 3,
                          fillColor: styles.fill,
                          fillOpacity: 0.95,
                        }}
                      >
                        <Popup>
                          <div className="min-w-[210px]">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Risk area
                            </p>

                            <h3 className="mt-1 text-base font-bold text-slate-900">
                              {zone.name}
                            </h3>

                            <div className="mt-3 inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-2.5 py-1">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    styles.fill,
                                }}
                              />

                              <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                                {zone.riskLevel} risk
                              </span>
                            </div>

                            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
                              <div className="flex justify-between gap-6">
                                <span className="text-slate-500">
                                  Incidents
                                </span>

                                <strong className="text-slate-800">
                                  {zone.incidentCount}
                                </strong>
                              </div>

                              <div className="flex justify-between gap-6">
                                <span className="text-slate-500">
                                  Duress events
                                </span>

                                <strong className="text-slate-800">
                                  {zone.duressEventCount}
                                </strong>
                              </div>

                              <div className="flex justify-between gap-6">
                                <span className="text-slate-500">
                                  Risk score
                                </span>

                                <strong className="text-slate-800">
                                  {zone.riskScore}/100
                                </strong>
                              </div>

                              <div className="flex justify-between gap-6">
                                <span className="text-slate-500">
                                  Awareness radius
                                </span>

                                <strong className="text-slate-800">
                                  {(
                                    zone.radiusMeters / 1000
                                  ).toFixed(1)}{" "}
                                  km
                                </strong>
                              </div>
                            </div>

                            {zone.description && (
                              <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
                                {zone.description}
                              </p>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    </Fragment>
                  );
                })}
              </MapContainer>
            </div>

            <div className="pointer-events-none absolute left-4 top-4 z-[400]">
              <div className="border border-white/80 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Highest concern
                </p>

                <p className="mt-0.5 text-sm font-bold text-[#0B2545]">
                  {highRiskCount} high-risk areas
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#E5EDF3] bg-[#FBFDFE] px-5 py-3">
            <RiskSummary
              risk="High"
              label="High-risk areas"
              zones={riskZones}
            />

            <RiskSummary
              risk="Medium"
              label="Medium-risk areas"
              zones={riskZones}
            />

            <RiskSummary
              risk="Low"
              label="Low-risk areas"
              zones={riskZones}
            />
          </div>
        </>
      )}
    </section>
  );
}