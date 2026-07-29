import { useState } from "react";
import Layout from "../../components/Layout";
import { ADMIN_ROLES } from "../../constants/roles";

const sampleUsers = [
  {
    id: "1",
    fullName: "Fraud Analyst",
    email: "analyst@globalone.co.za",
    role: ADMIN_ROLES.FraudAnalyst,
    status: "Active",
  },
  {
    id: "2",
    fullName: "Fraud Manager",
    email: "manager@globalone.co.za",
    role: ADMIN_ROLES.FraudManager,
    status: "Active",
  },
  {
    id: "3",
    fullName: "Secure Escape Admin",
    email: "admin@secureescape.co.za",
    role: ADMIN_ROLES.SecureEscapeAdmin,
    status: "Active",
  },
];

export default function AdminUsersPage() {
  const [users] = useState(sampleUsers);

  return (
    <Layout>
      <h1 className="dashboard-title">Users</h1>
      <p className="dashboard-subtitle mb-8">
        Create, review and remove test users for dashboard access.
      </p>

      <div className="dashboard-card mb-8">
        <div className="border-b border-slate-200 p-6">
          <h2 className="section-title">Create Test User</h2>
          <p className="mt-1 text-sm text-slate-500">
            Backend user management endpoints will connect to this form.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <input
            type="text"
            placeholder="Full name"
            className="  border border-slate-300 px-4 py-3"
          />

          <input
            type="email"
            placeholder="Email address"
            className="  border border-slate-300 px-4 py-3"
          />

          <select className="  border border-slate-300 px-4 py-3">
            <option value={ADMIN_ROLES.FraudAnalyst}>Fraud Analyst</option>
            <option value={ADMIN_ROLES.FraudManager}>Fraud Manager</option>
            <option value={ADMIN_ROLES.SecureEscapeAdmin}>
              Secure Escape Admin
            </option>
          </select>

          <input
            type="password"
            placeholder="Temporary password"
            className="  border border-slate-300 px-4 py-3"
          />

          <div className="md:col-span-2">
            <button className="  bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500">
              Create User
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <h2 className="section-title">Dashboard Users</h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4 text-slate-600">{user.role}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="  border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
