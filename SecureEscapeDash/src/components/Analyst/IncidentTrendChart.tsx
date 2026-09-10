import { Activity, TrendingUp } from "lucide-react";
import type { DuressSessionSummary } from "../../types/session";

type IncidentTrendChartProps = {
  sessions: DuressSessionSummary[];
  period: string;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
  });
}

function getPeriodLabel(
  period: string,
  numberOfDays: number,
) {
  if (period === "30") {
    return "Last 30 days";
  }

  if (period === "90") {
    return "Last 90 days";
  }

  if (period === "7") {
    return "Last 7 days";
  }

  return `${numberOfDays} days`;
}

export default function IncidentTrendChart({
  sessions,
  period,
}: IncidentTrendChartProps) {
  const today = startOfDay(new Date());

  let startDate: Date;

  if (period === "7") {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
  } else if (period === "30") {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
  } else if (period === "90") {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 89);
  } else if (sessions.length > 0) {
    const earliestSession = sessions.reduce(
      (earliest, session) => {
        const startedAt = startOfDay(
          new Date(session.startedAt),
        );

        return startedAt < earliest
          ? startedAt
          : earliest;
      },
      startOfDay(new Date(sessions[0].startedAt)),
    );

    startDate = earliestSession;
  } else {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
  }

  const dayDifference = Math.floor(
    (today.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const numberOfDays = Math.max(
    dayDifference + 1,
    1,
  );

  const days = Array.from(
    { length: numberOfDays },
    (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    },
  );

  const values = days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    return sessions.filter((session) => {
      const started = new Date(session.startedAt);

      return started >= day && started < nextDay;
    }).length;
  });

  const totalIncidents = values.reduce(
    (total, value) => total + value,
    0,
  );

  const activeDays = values.filter(
    (value) => value > 0,
  ).length;

  const peakValue = Math.max(...values, 0);
  const maxValue = Math.max(peakValue, 1);

  const width = 720;
  const height = 280;

  const paddingLeft = 46;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 42;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const pointDivisor = Math.max(
    values.length - 1,
    1,
  );

  const points = values.map((value, index) => {
    const x =
      paddingLeft +
      (index / pointDivisor) * chartWidth;

    const y =
      paddingTop +
      chartHeight -
      (value / maxValue) * chartHeight;

    return {
      x,
      y,
      value,
    };
  });

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${
          points[points.length - 1].x
        } ${paddingTop + chartHeight} L ${
          points[0].x
        } ${paddingTop + chartHeight} Z`
      : "";

  const labelInterval =
    numberOfDays <= 14
      ? 1
      : numberOfDays <= 35
        ? 5
        : numberOfDays <= 100
          ? 15
          : Math.ceil(numberOfDays / 6);

  const periodLabel =
    period === "all"
      ? "All activity"
      : getPeriodLabel(period, numberOfDays);

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EAF4FB] text-[#1769AA]">
            <Activity size={18} strokeWidth={1.8} />
          </div>

          <div>
            <p className="eyebrow">
              Activity intelligence
            </p>

            <h2 className="panel-heading">
              Duress incident activity
            </h2>

            <p className="panel-description">
              Incident volume across the selected reporting
              period.
            </p>
          </div>
        </div>

        <span className="panel-meta">
          {periodLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 border-b border-[#E5EDF3] bg-[#FBFDFE]">
        <div className="border-r border-[#E5EDF3] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Incidents
          </p>

          <p className="mt-1 text-2xl font-semibold text-[#0B2545]">
            {totalIncidents}
          </p>
        </div>

        <div className="border-r border-[#E5EDF3] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Peak day
          </p>

          <p className="mt-1 text-2xl font-semibold text-[#0B2545]">
            {peakValue}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Active days
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl font-semibold text-[#0B2545]">
              {activeDays}
            </p>

            {activeDays > 0 && (
              <TrendingUp
                size={15}
                className="text-[#1769AA]"
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
        {sessions.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
            No incident activity available for this
            period.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[280px] w-full"
            role="img"
            aria-label={`${periodLabel} duress incident activity chart`}
          >
            <defs>
              <linearGradient
                id="incidentAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#1769AA"
                  stopOpacity="0.18"
                />

                <stop
                  offset="100%"
                  stopColor="#1769AA"
                  stopOpacity="0.02"
                />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map(
              (ratio) => {
                const y =
                  paddingTop +
                  chartHeight -
                  ratio * chartHeight;

                const label = Math.round(
                  maxValue * ratio,
                );

                return (
                  <g key={ratio}>
                    <line
                      x1={paddingLeft}
                      x2={width - paddingRight}
                      y1={y}
                      y2={y}
                      className="chart-grid-line"
                    />

                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="chart-label"
                    >
                      {label}
                    </text>
                  </g>
                );
              },
            )}

            <path
              d={areaPath}
              fill="url(#incidentAreaGradient)"
            />

            <path
              d={linePath}
              fill="none"
              className="chart-line"
            />

            {points.map((point, index) => {
              const showDateLabel =
                index === 0 ||
                index === points.length - 1 ||
                index % labelInterval === 0;

              const showPoint =
                point.value > 0 ||
                numberOfDays <= 30;

              return (
                <g
                  key={`${days[
                    index
                  ].toISOString()}-${index}`}
                >
                  {showPoint && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={point.value > 0 ? 4.5 : 2.5}
                      className="chart-point"
                    />
                  )}

                  {point.value > 0 && (
                    <text
                      x={point.x}
                      y={point.y - 11}
                      textAnchor="middle"
                      className="chart-value"
                    >
                      {point.value}
                    </text>
                  )}

                  {showDateLabel && (
                    <text
                      x={point.x}
                      y={height - 11}
                      textAnchor={
                        index === 0
                          ? "start"
                          : index ===
                              points.length - 1
                            ? "end"
                            : "middle"
                      }
                      className="chart-label"
                    >
                      {formatDate(days[index])}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </section>
  );
}