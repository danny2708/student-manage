"use client"

import { Badge } from "../ui/badge"

interface User {
  user_id: number
  username: string
  role: string
  fullName: string
  email: string
}

interface UserModalProps {
  users: User[]
  onUserClick: (user: User) => void
}

export function UserModal({ users, onUserClick }: UserModalProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "teacher":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "student":
        return "bg-green-100 text-green-800 border-green-200"
      case "parent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user.user_id}
                onClick={() => onUserClick(user)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-600 font-medium">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getRoleBadgeColor(user.role)}>{user.role || "No role"}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-600">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
