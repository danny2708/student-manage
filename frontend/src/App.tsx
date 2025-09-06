"use client";

import { AuthProvider } from "../src/contexts/AuthContext";

export default function App({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
