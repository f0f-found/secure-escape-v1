import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/authService";
import { saveToken, saveAdminUser } from "../utils/tokenStore";
import { cleanText, validateEmail, validatePassword } from "../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanedEmail = cleanText(email);
    const nextFieldErrors = {
      email: validateEmail(cleanedEmail),
      password: validatePassword(password),
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.password) {
      return;
    }

    setLoading(true);

    try {
      const response = await adminLogin({
        email: cleanedEmail,
        password,
      });
      saveToken(response.token);
      saveAdminUser(response);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Secure Escape</h1>
          <p className="text-gray-400 text-sm mt-1">Fraud Team Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((current) => ({ ...current, email: "" }));
                }}
                required
                aria-invalid={Boolean(fieldErrors.email)}
                className={`w-full bg-gray-800 text-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                  fieldErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                placeholder="you@bank.co.za"
              />
              {fieldErrors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((current) => ({ ...current, password: "" }));
                }}
                required
                minLength={8}
                aria-invalid={Boolean(fieldErrors.password)}
                className={`w-full bg-gray-800 text-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                  fieldErrors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Secure Escape — Internal Use Only
        </p>
      </div>
    </div>
  );
}
