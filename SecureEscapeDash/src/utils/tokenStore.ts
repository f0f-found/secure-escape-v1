const TOKEN_KEY = "secure_escape_admin_token";
const ADMIN_KEY = "secure_escape_admin_user";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function saveAdminUser(user: object) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(user));
}

export function getAdminUser() {
  const data = localStorage.getItem(ADMIN_KEY);
  return data ? JSON.parse(data) : null;
}
