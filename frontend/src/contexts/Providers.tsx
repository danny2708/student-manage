"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { UsersProvider } from "./UsersContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsersProvider>{children}</UsersProvider>
    </AuthProvider>
  );
}
