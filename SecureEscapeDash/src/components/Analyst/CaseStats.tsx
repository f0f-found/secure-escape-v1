import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  UserRoundX,
} from "lucide-react";

type CaseStatsProps = {
  activeCases: number;
  criticalCases: number;
  assignedCases: number;
  unassignedCases: number;
  resolvedToday: number;
};

export default function CaseStats({
  activeCases,
  criticalCases,
  assignedCases,
  unassignedCases,
  resolvedToday,
}: CaseStatsProps) {
  const stats = [
    {
      label: "Active cases",
      value: activeCases,
      detail: "Live duress sessions",
      icon: Activity,
      accent: "bg-[#1769AA]",
      iconBg: "bg-[#EAF4FB]",
      iconText: "text-[#1769AA]",
    },
    {
      label: "Critical / high",
      value: criticalCases,
      detail: "Priority investigations",
      icon: AlertTriangle,
      accent: "bg-[#B42318]",
      iconBg: "bg-[#FEF3F2]",
      iconText: "text-[#B42318]",
    },
    {
      label: "Assigned to me",
      value: assignedCases,
      detail: "Your current workload",
      icon: UserCheck,
      accent: "bg-[#365C7D]",
      iconBg: "bg-[#EDF3F7]",
      iconText: "text-[#365C7D]",
    },
    {
      label: "Unassigned",
      value: unassignedCases,
      detail: "Waiting for analyst",
      icon: UserRoundX,
      accent: "bg-[#D97706]",
      iconBg: "bg-[#FFF7ED]",
      iconText: "text-[#B45309]",
    },
    {
      label: "Resolved today",
      value: resolvedToday,
      detail: "Completed investigations",
      icon: CheckCircle2,
      accent: "bg-[#16815D]",
      iconBg: "bg-[#ECFDF3]",
      iconText: "text-[#16815D]",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className="relative overflow-hidden border border-[#DCE5ED] bg-white px-5 py-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${stat.accent}`}
            />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em] text-[#0B2545]">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center ${stat.iconBg} ${stat.iconText}`}
              >
                <Icon size={19} strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                {stat.detail}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
