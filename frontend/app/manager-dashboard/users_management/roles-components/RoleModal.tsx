"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../../../../components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../../../../components/ui/tabs"
import { StudentRole } from "./roles/student-role"
import { TeacherRole } from "./roles/teacher-role"
import { ParentRole } from "./roles/parent-role"
import { User as UserIcon, GraduationCap, Users } from "lucide-react"

interface User {
  user_id: number
  username: string
  roles: string[]
  full_name: string
  email: string
}

interface RoleModalProps {
  user: User
  onClose: () => void
  onShowInfo: () => void;
  onDelete: () => void;
}

export function RoleModal({ user, onClose, onShowInfo, onDelete }: RoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.roles[0] as "student" | "teacher" | "parent")

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {user.full_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)} className="w-full">
          <TabsList className={`grid w-full grid-cols-${user.roles.length}`}>
            {user.roles.includes("student") && (
              <TabsTrigger value="student" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Student
              </TabsTrigger>
            )}
            {user.roles.includes("teacher") && (
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Teacher
              </TabsTrigger>
            )}
            {user.roles.includes("parent") && (
              <TabsTrigger value="parent" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Parent
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="student" className="mt-6">
            <StudentRole user={user} />
          </TabsContent>
          <TabsContent value="teacher" className="mt-6">
            <TeacherRole user={user} />
          </TabsContent>
          <TabsContent value="parent" className="mt-6">
            <ParentRole user={user} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}