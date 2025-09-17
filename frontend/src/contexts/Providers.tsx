"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { UsersProvider } from "./UsersContext";
import { SubjectProvider } from "./SubjectContext";
import { ClassesProvider } from "./ClassContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsersProvider>
        <SubjectProvider>
          <ClassesProvider>
            {children}
          </ClassesProvider>
        </SubjectProvider>
      </UsersProvider>
    </AuthProvider>
  );
}
