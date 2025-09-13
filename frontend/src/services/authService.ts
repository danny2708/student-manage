export interface ILoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
}

export interface IUser {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

class AuthService {
  private _token: string | null = null;
  private _user: IUser | null = null;
  private _ready = false;

  constructor() {
    if (typeof window !== "undefined") {
      this._ready = true;
      this._token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");
      console.log("Init user", storedUser);
      if (storedUser) {
        try {
          this._user = JSON.parse(storedUser);
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
          localStorage.removeItem("user");
        }
      }
    }
  }

  isReady(): boolean {
    return this._ready;
  }

  get token(): string | null {
    if (typeof window === "undefined") return null;
    if (!this._token) this._token = localStorage.getItem("access_token");
    return this._token;
  }

  set token(value: string | null) {
    this._token = value;
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem("access_token", value);
      else localStorage.removeItem("access_token");
    }
  }

  get user(): IUser | null {
    if (typeof window === "undefined") return null;
    if (!this._user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          this._user = JSON.parse(storedUser);
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
          localStorage.removeItem("user");
        }
      }
    }
    return this._user;
  }

  set user(value: IUser | null) {
    this._user = value;
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem("user", JSON.stringify(value));
      else localStorage.removeItem("user");
    }
  }

  async login({ username, password }: { username: string; password: string }) {
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

      const data: ILoginResponse = await res.json();
      console.log("Login API response", data);
      this.token = data.access_token;
      this.user = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        roles: data.roles,
      };

      return { success: true, user: this.user as IUser };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: (err as Error).message };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
  }

  isAuthenticated(): boolean {
    if (!this._ready) return false; // ✅ Chặn SSR gọi
    console.log("Check auth", { token: this.token, user: this.user });
    return !!this.token && !!this.user;
  }

  getRole(): string | null {
    const u = this.user;
    return u && u.roles.length > 0 ? u.roles[0] : null;
  }

  hasRole(role: string): boolean {
    const u = this.user;
    return !!u && u.roles.includes(role);
  }

  getDashboardRoute(): string {
    const user = this.user;
    if (!user || !user.roles || user.roles.length === 0) return "/login";

    if (user.roles.includes("manager")) return "/manager-dashboard";
    if (user.roles.includes("teacher")) return "/teacher-dashboard";
    if (user.roles.includes("student")) return "/student-dashboard";
    if (user.roles.includes("parent")) return "/parent-dashboard";

    return "/login";
  }

  redirectToDashboardIfLoggedIn(): void {
    if (!this._ready) return; // ✅ tránh SSR
    if (this.isAuthenticated()) {
      const route = this.getDashboardRoute();
      if (window.location.pathname !== route) {
        window.location.href = route;
      }
    }
  }
}

export default new AuthService();