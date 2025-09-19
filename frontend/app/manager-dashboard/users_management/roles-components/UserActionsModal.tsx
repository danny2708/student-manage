"use client"

import { useState, useCallback } from "react"
import { RoleModal } from "./RoleModal"
import { Button } from "../../../../components/ui/button"

interface User {
  user_id: number
  username: string
  roles: string[]
  full_name: string
  email: string
}

interface UserActionModalProps {
  users: User[]
  onDeleteUser: (user: User) => void
  onShowUserInfo: (user: User) => void
}

export function UserActionModal({ users, onDeleteUser, onShowUserInfo }: UserActionModalProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const memoizedOnShowInfo = useCallback(() => {
    if (selectedUser) {
      onShowUserInfo(selectedUser)
    }
  }, [onShowUserInfo, selectedUser])

  const memoizedOnDelete = useCallback(() => {
    if (selectedUser) {
      onDeleteUser(selectedUser)
    }
  }, [onDeleteUser, selectedUser])

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.user_id}
          onClick={() => setSelectedUser(user)}
          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 cursor-pointer"
        >
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">Roles: {user.roles.join(", ")}</p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteUser(user)
            }}
          >
            Delete
          </Button>
        </div>
      ))}

      {selectedUser && (
        <RoleModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onShowInfo={memoizedOnShowInfo}
          onDelete={memoizedOnDelete}
        />
      )}
    </div>
  )
}