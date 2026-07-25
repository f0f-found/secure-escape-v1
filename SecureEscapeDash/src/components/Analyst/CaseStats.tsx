type CaseStatsProps = {
  activeCases: number;
  criticalCases: number;
  assignedCases: number;
  resolvedToday: number;
};

export default function CaseStats({
  activeCases,
  criticalCases,
  assignedCases,
  resolvedToday,
}: CaseStatsProps) {
  const stats = [
    {
      label: "Active Cases",
      value: activeCases,
    },
    {
      label: "Critical Cases",
      value: criticalCases,
    },
    {
      label: "Assigned to Me",
      value: assignedCases,
    },
    {
      label: "Resolved Today",
      value: resolvedToday,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {stat.value}
          </h2>
        </div>
      ))}
    </section>
  );
}
