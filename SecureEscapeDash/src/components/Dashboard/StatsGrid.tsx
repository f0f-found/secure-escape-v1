interface StatsGridProps {
  children: React.ReactNode;
}

export default function StatsGrid({ children }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {children}
    </div>
  );
}
