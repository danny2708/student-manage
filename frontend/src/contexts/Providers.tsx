"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { UsersProvider } from "./UsersContext";
import { SubjectProvider } from "./SubjectContext";
import { ClassesProvider } from "./ClassContext";
import { ScheduleProvider } from "./ScheduleContext"; 

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsersProvider>
        <SubjectProvider>
          <ClassesProvider>
            <ScheduleProvider> 
              {children}
            </ScheduleProvider>
          </ClassesProvider>
        </SubjectProvider>
      </UsersProvider>
    </AuthProvider>
  );
}
