import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  valueColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueColor = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="dashboard-card dashboard-card-body h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="kpi-title">{title}</p>

          <h2 className={`kpi-value ${valueColor}`}>{value}</h2>

          {subtitle && (
            <p className="text-sm text-slate-500 mt-2">{subtitle}</p>
          )}
        </div>

        {icon && <div className="text-brand text-2xl">{icon}</div>}
      </div>
    </div>
  );
}
