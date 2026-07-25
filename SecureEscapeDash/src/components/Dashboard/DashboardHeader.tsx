interface DashboardHeaderProps {
  title: string;
  description: string;
}

export default function DashboardHeader({
  title,
  description,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <p className="uppercase tracking-widest text-sm font-semibold text-orange-500">
        SecureEscape
      </p>

      <h1 className="dashboard-title mt-2">{title}</h1>

      <p className="dashboard-subtitle">{description}</p>
    </div>
  );
}
