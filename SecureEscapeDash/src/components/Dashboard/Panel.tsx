import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function Panel({ title, children, action }: PanelProps) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-body">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title">{title}</h2>

          {action}
        </div>

        {children}
      </div>
    </div>
  );
}
