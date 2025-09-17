"use client";

import { AuthProvider } from "../src/contexts/AuthContext";
import { UsersProvider } from "../src/contexts/UsersContext";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UsersProvider>
        {children}
      </UsersProvider>
    </AuthProvider>
  );
}
