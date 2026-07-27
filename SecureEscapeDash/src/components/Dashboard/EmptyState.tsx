interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="dashboard-card dashboard-card-body text-center py-16">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>

      <p className="text-slate-500 mt-2">{description}</p>
    </div>
  );
}
