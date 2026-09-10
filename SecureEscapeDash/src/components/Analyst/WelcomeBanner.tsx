import { ShieldCheck } from "lucide-react";

type WelcomeBannerProps = {
  fullName?: string;
  period: string;
  onPeriodChange: (period: string) => void;
};

export default function WelcomeBanner({
  fullName,
  period,
  onPeriodChange,
}: WelcomeBannerProps) {
  const firstName =
    fullName?.split(" ")[0] ?? "Analyst";

  return (
    <section className="mb-5 overflow-hidden border border-[#D9E6F2] bg-[#F4F8FC] shadow-sm">
      <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#12355B] text-white">
            <ShieldCheck size={23} strokeWidth={1.8} />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1769AA]">
              Fraud Operations Centre
            </p>

            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#0B2545]">
              Good evening, {firstName}
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Monitor duress incidents, active investigations,
              and analyst response performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l-0 border-[#D5E2EE] lg:border-l lg:pl-6">
          <div className="hidden text-right sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Dashboard period
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Filter operational activity
            </p>
          </div>

          <select
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value)
            }
            className="min-w-[150px] border border-[#CBD9E6] bg-white px-3 py-2.5 text-sm font-semibold text-[#12355B] outline-none transition focus:border-[#1769AA] focus:ring-2 focus:ring-[#DCEFFA]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All activity</option>
          </select>
        </div>
      </div>

      <div className="h-1 bg-[#1769AA]" />
    </section>
  );
}