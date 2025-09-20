"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { StudentRole } from "./roles/student-role"
import { TeacherRole } from "./roles/teacher-role"
import { ParentRole } from "./roles/parent-role"
import { User as UserIcon, GraduationCap, Users } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "../../../../components/ui/button"
import { useUsers } from "../../../../src/contexts/UsersContext"   

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
  onShowInfo: () => void
}

export function RoleModal({ user, onClose, onShowInfo }: RoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.roles[0] as "student" | "teacher" | "parent")
  const [loading, setLoading] = useState(false)
  const { removeUser } = useUsers()

  const handleDelete = async () => {
    try {
      setLoading(true)
      await removeUser(user.user_id)   
      onClose()                        
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[81vw] min-w-[1100px] w-full max-h-[95vh] overflow-y-auto bg-slate-800 text-white border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            {user.full_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)} className="w-full">
          <TabsList className={`grid w-full grid-cols-${user.roles.length} bg-slate-700 border-slate-600`}>
            {user.roles.includes("student") && (
              <TabsTrigger value="student" className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white">
                <UserIcon className="w-4 h-4" />
                Student
              </TabsTrigger>
            )}
            {user.roles.includes("teacher") && (
              <TabsTrigger value="teacher" className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white">
                <GraduationCap className="w-4 h-4" />
                Teacher
              </TabsTrigger>
            )}
            {user.roles.includes("parent") && (
              <TabsTrigger value="parent" className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white">
                <Users className="w-4 h-4" />
                Parent
              </TabsTrigger>
            )}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="student" className="mt-6">
              <motion.div
                key="student-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StudentRole user={user} />
              </motion.div>
            </TabsContent>

            <TabsContent value="teacher" className="mt-6">
              <motion.div
                key="teacher-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TeacherRole user={user} />
              </motion.div>
            </TabsContent>

            <TabsContent value="parent" className="mt-6">
              <motion.div
                key="parent-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ParentRole user={user} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* ✅ nút Delete căn giữa ở cuối modal */}
        <div className="flex justify-center mt-8">
          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
            className="px-8 py-2"
          >
            {loading ? "Đang xóa..." : "Xóa User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
