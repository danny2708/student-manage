const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class AuthService {
  constructor() {
    this._token = null;
    this._user = null;
  }

  get token() {
    if (typeof window === "undefined") return this._token;
    return this._token || localStorage.getItem("access_token");
  }

  set token(value) {
    this._token = value;
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem("access_token", value);
      else localStorage.removeItem("access_token");
    }
  }

  // Trong class AuthService
  getDashboardRoute() {
    const user = this.user;
    if (!user || !user.roles || user.roles.length === 0) return "/login";

    if (user.roles.includes("manager")) return "/dashboard/manager";
    if (user.roles.includes("teacher")) return "/dashboard/teacher";
    if (user.roles.includes("student")) return "/dashboard/student";
    if (user.roles.includes("parent")) return "/dashboard/parent";

    return "/login";
  }


  get user() {
    if (typeof window === "undefined") return this._user;
    if (this._user) return this._user;
    const storedUser = localStorage.getItem("user");
    this._user = storedUser ? JSON.parse(storedUser) : null;
    return this._user;
  }

  set user(value) {
    this._user = value;
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem("user", JSON.stringify(value));
      else localStorage.removeItem("user");
    }
  }

  async login({ username, password }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }

      const data = await res.json();
      this.token = data.access_token;
      this.user = data; // store full user info from login response

      return { success: true, user: data };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: err.message };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Trong class AuthService
  getDashboardRoute() {
    const user = this.user;
    if (!user || !user.roles || user.roles.length === 0) return "/login";

    // Ví dụ: ưu tiên theo vai trò
    if (user.roles.includes("manager")) return "/manager-dashboard";
    if (user.roles.includes("teacher")) return "/teacher-dashboard";
    if (user.roles.includes("student")) return "/student-dashboard";

    // Nếu không xác định vai trò
    return "/login";
  }

}

export default new AuthService();
