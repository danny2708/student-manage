// src/services/api/auth.ts
export interface ILoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];

  // thêm các field mới backend trả về
  phone: string;
  gender: string;
  dob: string;
}

export interface IUser {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  phone: string;
  gender: string;
  dob: string;
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
      this._user = this.getUser(); // ✅ đọc user khi khởi tạo
    }
  }

  /** ✅ Đọc user từ localStorage an toàn */
  getUser(): IUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IUser;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  }

  /** ✅ Ghi user vào localStorage */
  setUser(user: IUser | null) {
    this._user = user;
    if (typeof window !== "undefined") {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
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

  /** ✅ Trả về this._user hoặc đọc lại từ localStorage nếu null */
  get user(): IUser | null {
    if (!this._user) this._user = this.getUser();
    return this._user;
  }

  set user(value: IUser | null) {
    this.setUser(value);
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
      this.token = data.access_token;
      const userData: IUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        roles: data.roles,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
      };
      this.setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

async updatePassword(userId: number, oldPassword: string, newPassword: string) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Đổi mật khẩu thất bại");
    }

    return await res.json();
  }


  logout() {
    this.token = null;
    this.setUser(null);
  }

  isAuthenticated(): boolean {
    return this._ready && !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    const u = this.user;
    return !!u && u.roles.includes(role);
  }

  getDashboardRoute(): string {
    const user = this.user;
    if (!user || user.roles.length === 0) return "/login";

    if (user.roles.includes("manager")) return "/manager-dashboard";
    if (user.roles.includes("teacher")) return "/teacher-dashboard";
    if (user.roles.includes("student")) return "/student-dashboard";
    if (user.roles.includes("parent")) return "/parent-dashboard";

    return "/login";
  }

  redirectToDashboardIfLoggedIn(): void {
    if (!this._ready) return;
    if (this.isAuthenticated()) {
      const route = this.getDashboardRoute();
      if (window.location.pathname !== route) {
        window.location.href = route;
      }
    }
  }
}

export default new AuthService();
