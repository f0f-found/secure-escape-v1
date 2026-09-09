import { Fragment } from "react";
import { MapPinned } from "lucide-react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

type RiskLevel = "High" | "Medium" | "Low";

type RiskArea = {
  id: string;
  name: string;
  risk: RiskLevel;
  incidents: number;
  duressEvents: number;
  riskScore: number;
  center: [number, number];
  radius: number;
};

const riskAreas: RiskArea[] = [
  {
    id: "alexandra",
    name: "Alexandra",
    risk: "High",
    incidents: 14,
    duressEvents: 9,
    riskScore: 88,
    center: [-26.1025, 28.1005],
    radius: 2600,
  },
  {
    id: "hillbrow",
    name: "Hillbrow",
    risk: "High",
    incidents: 11,
    duressEvents: 7,
    riskScore: 82,
    center: [-26.1906, 28.0467],
    radius: 2200,
  },
  {
    id: "rosettenville",
    name: "Rosettenville",
    risk: "High",
    incidents: 10,
    duressEvents: 6,
    riskScore: 78,
    center: [-26.2607, 28.0357],
    radius: 2400,
  },
  {
    id: "jeppestown",
    name: "Jeppestown",
    risk: "High",
    incidents: 8,
    duressEvents: 5,
    riskScore: 74,
    center: [-26.1952, 28.0648],
    radius: 1900,
  },
  {
    id: "soweto",
    name: "Soweto",
    risk: "High",
    incidents: 12,
    duressEvents: 7,
    riskScore: 76,
    center: [-26.2485, 27.8546],
    radius: 3000,
  },
  {
    id: "braamfontein",
    name: "Braamfontein",
    risk: "Medium",
    incidents: 7,
    duressEvents: 3,
    riskScore: 58,
    center: [-26.1929, 28.0311],
    radius: 1800,
  },
  {
    id: "berea",
    name: "Berea",
    risk: "Medium",
    incidents: 6,
    duressEvents: 3,
    riskScore: 54,
    center: [-26.1851, 28.0507],
    radius: 1700,
  },
  {
    id: "central-johannesburg",
    name: "Johannesburg CBD",
    risk: "Medium",
    incidents: 5,
    duressEvents: 2,
    riskScore: 49,
    center: [-26.2041, 28.0473],
    radius: 2000,
  },
  {
    id: "sandton",
    name: "Sandton",
    risk: "Low",
    incidents: 2,
    duressEvents: 1,
    riskScore: 22,
    center: [-26.1076, 28.0567],
    radius: 2300,
  },
  {
    id: "rosebank",
    name: "Rosebank",
    risk: "Low",
    incidents: 2,
    duressEvents: 1,
    riskScore: 19,
    center: [-26.1466, 28.0368],
    radius: 1800,
  },
  {
    id: "fourways",
    name: "Fourways",
    risk: "Low",
    incidents: 1,
    duressEvents: 0,
    riskScore: 14,
    center: [-26.0196, 28.0126],
    radius: 2400,
  },
  {
    id: "melrose",
    name: "Melrose",
    risk: "Low",
    incidents: 1,
    duressEvents: 0,
    riskScore: 12,
    center: [-26.1299, 28.0829],
    radius: 1600,
  },
];

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

function getRiskCount(risk: RiskLevel) {
  return riskAreas.filter(
    (area) => area.risk === risk,
  ).length;
}

function RiskSummary({
  risk,
  label,
}: {
  risk: RiskLevel;
  label: string;
}) {
  const count = getRiskCount(risk);
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
  const highRiskCount = getRiskCount("High");

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
      </div>

      <div className="grid grid-cols-3 border-b border-[#E5EDF3] bg-[#FBFDFE]">
        <div className="border-r border-[#E5EDF3] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            High risk
          </p>

          <p className="mt-1 text-xl font-semibold text-red-600">
            {getRiskCount("High")}
          </p>
        </div>

        <div className="border-r border-[#E5EDF3] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Medium
          </p>

          <p className="mt-1 text-xl font-semibold text-orange-600">
            {getRiskCount("Medium")}
          </p>
        </div>

        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Low risk
          </p>

          <p className="mt-1 text-xl font-semibold text-blue-600">
            {getRiskCount("Low")}
          </p>
        </div>
      </div>

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

            {riskAreas.map((area) => {
              const styles =
                getRiskStyles(area.risk);

              return (
                <Fragment key={area.id}>
                  <Circle
                    center={area.center}
                    radius={area.radius}
                    pathOptions={{
                      color: styles.stroke,
                      fillColor: styles.softFill,
                      fillOpacity: 0.25,
                      weight: 1.5,
                    }}
                  />

                  <CircleMarker
                    center={area.center}
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
                          {area.name}
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
                            {area.risk} risk
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-500">
                              Incidents
                            </span>

                            <strong className="text-slate-800">
                              {area.incidents}
                            </strong>
                          </div>

                          <div className="flex justify-between gap-6">
                            <span className="text-slate-500">
                              Duress events
                            </span>

                            <strong className="text-slate-800">
                              {area.duressEvents}
                            </strong>
                          </div>

                          <div className="flex justify-between gap-6">
                            <span className="text-slate-500">
                              Risk score
                            </span>

                            <strong className="text-slate-800">
                              {area.riskScore}/100
                            </strong>
                          </div>
                        </div>
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
        />

        <RiskSummary
          risk="Medium"
          label="Medium-risk areas"
        />

        <RiskSummary
          risk="Low"
          label="Low-risk areas"
        />
      </div>
    </section>
  );
}