<<<<<<< HEAD
// src/services/authService.ts
=======
﻿// src/services/authService.ts

import api from "./api/api";

>>>>>>> bb0dd92 (add gg auth)
export interface ILoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  phone?: string;
  gender?: string;
  dob?: string;
}

export interface IUser {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  phone?: string;
  gender?: string;
  dob?: string;
}

<<<<<<< HEAD
=======


>>>>>>> bb0dd92 (add gg auth)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// keys
const AUTH_BROADCAST_KEY = "app_auth_event";
const TOKEN_KEY = "access_token";
const USER_KEY = "user";

class AuthService {
  private _token: string | null = null;
  private _user: IUser | null = null;
  private _initialized = false;
  private _bc: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this._bc = new BroadcastChannel("app_auth_channel");
    }
  }

  async init(): Promise<void> {
    if (typeof window === "undefined") {
      this._initialized = true;
      return;
    }
    this._token = localStorage.getItem(TOKEN_KEY);
    this._user = this._safeGetUser();
    this._initialized = true;
  }

  private _safeGetUser(): IUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  get initialized() {
    return this._initialized;
  }

  get token(): string | null {
    if (typeof window === "undefined") return null;
    if (!this._token) this._token = localStorage.getItem(TOKEN_KEY);
    return this._token;
  }

  set token(value: string | null) {
    this._token = value;
    if (typeof window === "undefined") return;
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  }

  get user(): IUser | null {
    if (!this._user) this._user = this._safeGetUser();
    return this._user;
  }

  set user(u: IUser | null) {
    this._user = u;
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }

  /**
   * Broadcast auth events (both localStorage + BroadcastChannel).
   */
  private broadcast(event: { type: "login" | "logout" | "token-changed"; ts?: number; user?: any }) {
    if (typeof window === "undefined") return;
    const payload = { ...event, ts: Date.now() };
    try {
      // via localStorage
      localStorage.setItem(AUTH_BROADCAST_KEY, JSON.stringify(payload));
      // via BroadcastChannel
      this._bc?.postMessage(payload);
    } catch {
      /* ignore */
    }
  }

  async login({ username, password }: { username: string; password: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = payload?.detail || payload?.message || "Login failed";
        throw new Error(message);
      }
      const data = payload as ILoginResponse;

      this.token = data.access_token;
      const userData: IUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        roles: data.roles || [],
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
      };
      this.user = userData;

      // broadcast login
      this.broadcast({ type: "login", user: { user_id: userData.user_id, username: userData.username } });

      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: err?.message || "Login failed" };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
<<<<<<< HEAD
=======
     
>>>>>>> bb0dd92 (add gg auth)
    this.broadcast({ type: "logout" });
  }

  reloadFromStorage() {
    this._token = localStorage.getItem(TOKEN_KEY);
    this._user = this._safeGetUser();
  }

  isAuthenticated(): boolean {
    return this._initialized && !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    const u = this.user;
    return !!u && Array.isArray(u.roles) && u.roles.includes(role);
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
<<<<<<< HEAD
}

=======

  /**
 * Đăng nhập với Google SSO
 * @param code Mã code/ID token từ Google
 */
  async loginWithGoogle(code: string) {
    try {
      // Gọi backend endpoint SSO
      const res = await api.get(`/auth/google?code=${encodeURIComponent(code)}`);
      const data = res.data as ILoginResponse;

      // Lưu token và user như login thường
      this.token = data.access_token;
      const userData: IUser = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        roles: data.roles || [],
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
      };
      this.user = userData;

      // broadcast login
      this.broadcast({ type: "login", user: { user_id: userData.user_id, username: userData.username } });

      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: err?.message || "Google login failed" };
    }
  }
  /**
 * Lấy thông tin người dùng hiện tại từ API bằng token đã lưu.
 * @returns Thông tin user hoặc null.
 */


async fetchUser(): Promise<IUser | null> {
    const currentToken = this.token;
    if (!currentToken) return null;

    try {
        // Giả định bạn có một API client 'api' được định nghĩa hoặc import
        // Gọi đến endpoint mới được tạo ở backend (GET /auth/me)
        const res = await (api as any).get(`/auth/me`, currentToken); 
        const data = res.data;

        // Ánh xạ dữ liệu nhận được từ API vào interface IUser
        const userData: IUser = {
            user_id: data.user_id,
            username: data.username,
            email: data.email,
            full_name: data.full_name,
            roles: data.roles || [],
            phone: data.phone,
            gender: data.gender,
            dob: data.dob,
        };
        
        this.user = userData;
        return userData;
    } catch (error) {
        console.error("Error fetching user:", error);
        this.logout(); // Xóa token nếu không thể lấy user
        throw error;
    }
}


/**
 * Xử lý token nhận được từ URL sau callback, lưu token và fetch user.
 * 🌟 Đây là hàm mà page.tsx đang cố gọi! 🌟
 * @param token JWT nhận từ URL
 * @returns Thông tin user hoặc null
 */
async handleTokenAndFetchUser(token: string): Promise<IUser | null> {
    try {
        // 1. Lưu token (sử dụng setter đã có)
        this.token = token;
        
        // 2. Fetch User
        const user = await this.fetchUser();
        
        if (user) {
            this.broadcast({ type: "login", user: { user_id: user.user_id, username: user.username } });
        }
        return user;
    } catch (e) {
        this.logout();
        throw e;
    }
}
}


>>>>>>> bb0dd92 (add gg auth)
export default new AuthService();
