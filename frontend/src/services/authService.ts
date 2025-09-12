// Định nghĩa các Interface và Type cho dữ liệu
export interface ILoginResponse {
  access_token: string;
  user_id: number; // Hoặc number, tùy thuộc vào API của bạn
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
  // Thêm các trường khác của user nếu cần
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

class AuthService {
  private _token: string | null = null;
  private _user: IUser | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this._token = localStorage.getItem("access_token");
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
  }

  get token(): string | null {
    if (typeof window === "undefined") return this._token;
    return this._token || localStorage.getItem("access_token");
  }

  set token(value: string | null) {
    this._token = value;
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem("access_token", value);
      else localStorage.removeItem("access_token");
    }
  }

  get user(): IUser | null {
    if (typeof window === "undefined") return this._user;
    if (this._user) return this._user;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        this._user = parsedUser;
        return this._user;
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    return null;
  }

  set user(value: IUser | null) {
    this._user = value;
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem("user", JSON.stringify(value));
      else localStorage.removeItem("user");
    }
  }

  async login({ username, password }: { username: string; password: string }): Promise<{ success: boolean; user?: IUser; error?: string }> {
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

  logout(): void {
    this.token = null;
    this.user = null;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
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
}

export default new AuthService();
