import type { AdminLoginResponse } from "../../types/auth";

type TopBarProps = {
  admin: AdminLoginResponse | null;
};

export default function TopBar({ admin }: TopBarProps) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Fraud Operations Centre
        </h2>

        <p className="text-sm text-slate-500">
          Monitor fraud investigations and duress alerts
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-slate-900">{admin?.fullName}</p>

        <p className="text-sm text-slate-500">{admin?.adminRole}</p>
      </div>
    </header>
  );
}
