"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { UsersProvider } from "./UsersContext";
import { SubjectProvider } from "./SubjectContext";
import { ClassesProvider } from "./ClassContext";
import { ScheduleProvider } from "./ScheduleContext";
import { StudentProvider } from "./StudentContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsersProvider>
        <SubjectProvider>
          <ClassesProvider>
            <ScheduleProvider>
              <StudentProvider>  
                {children}
              </StudentProvider>
            </ScheduleProvider>
          </ClassesProvider>
        </SubjectProvider>
      </UsersProvider>
    </AuthProvider>
  );
}
