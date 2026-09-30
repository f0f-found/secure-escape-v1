import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import Layout from "../../components/Layout";
import type { AdminUserSummary } from "../../types/auth";
import { getAnalysts } from "../../services/sessionService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const data = await getAnalysts();

        setUsers(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load staff directory.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [searchTerm, users]);

  return (
    <Layout>
      <div className="mx-auto max-w-[1440px] space-y-6">
        <section className="relative overflow-hidden rounded-xl border border-[#163E61] bg-[#102F4A] px-6 py-6 shadow-[0_12px_32px_rgba(15,47,74,0.14)] lg:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-8 h-36 w-36 rounded-full border border-white/10" />

          <div className="relative">
            <div className="mb-3 flex items-center gap-2 text-blue-200">
              <ShieldCheck size={17} />

              <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
                Access Administration
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
              Users & Access
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              View fraud analysts currently registered under
              the connected banking environment.
            </p>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-lg border border-[#D6E1EA] bg-white p-5 shadow-[0_4px_14px_rgba(15,47,74,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#1769AA]" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Registered Analysts
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-[#102A43]">
                  {loading ? "..." : users.length}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Active fraud analysts available in the
                  current integration.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1769AA]">
                <UsersRound size={19} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-[#D6E1EA] bg-white p-5 shadow-[0_4px_14px_rgba(15,47,74,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-emerald-500" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Access Scope
                </p>

                <p className="mt-2 text-lg font-bold tracking-tight text-[#102A43]">
                  Fraud Analyst
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  This directory currently reflects analyst
                  accounts exposed by the platform.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck size={19} />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#D5E1EB] bg-white shadow-[0_7px_22px_rgba(15,47,74,0.06)]">
          <div className="flex flex-col gap-4 border-b border-[#DFE8EF] bg-gradient-to-r from-[#F3F8FC] to-white px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#1769AA]">
                Staff Directory
              </p>

              <h2 className="mt-1 text-base font-bold text-[#102A43]">
                Fraud Analysts
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Active analysts registered for dashboard
                investigation access.
              </p>
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search name or email"
                className="w-full rounded-lg border border-[#D5E1EB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#102A43] outline-none transition placeholder:text-slate-400 focus:border-[#1769AA] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-slate-500">
                Loading staff directory...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <UserRound
                  size={22}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-3 text-sm font-semibold text-[#102A43]">
                No analysts found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No active analyst accounts match your
                current search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#DCE6EE] bg-[#F4F8FB]">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Analyst
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Access
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#E7EEF4] last:border-b-0 hover:bg-[#F8FBFD]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF4FB] text-[#1769AA]">
                            <UserRound size={17} />
                          </div>

                          <p className="text-sm font-semibold text-[#102A43]">
                            {user.fullName}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md border border-[#CFE0ED] bg-[#F3F8FC] px-2.5 py-1 text-xs font-semibold text-[#1769AA]">
                          Fraud Analyst
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}