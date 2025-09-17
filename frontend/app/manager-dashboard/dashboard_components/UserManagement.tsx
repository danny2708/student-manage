import * as React from "react"
import { Users, Settings } from "lucide-react"
import { useUsers } from "../../../src/hooks/useUsers"

interface UserManagementProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
  handleCreateNew: (type: string) => void
  handleTableRowClick: (type: string, data: any) => void
}

export default function UserManagement({
  searchTerm,
  updateSearchTerm,
  handleCreateNew,
  handleTableRowClick,
}: UserManagementProps) {
  const { users, loading, error } = useUsers()
  const [selectedRole, setSelectedRole] = React.useState<string>("")
  const [showFilter, setShowFilter] = React.useState(false)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole ? user.roles?.includes(selectedRole) : true

    return matchesSearch && matchesRole
  })

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => handleCreateNew("user")}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
        >
          Create New User
        </button>
      </div>

      <div className="text-gray-900 flex items-center gap-3 mb-6 relative">
        <div className="relative flex-[2]">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("user", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Users className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-4 py-2 bg-gray-500 border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          Filter
        </button>

        {showFilter && (
          <div className="absolute top-14 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-48 z-10">
            <h4 className="font-semibold mb-2 text-gray-800">Filter by Role</h4>
            <select
              aria-label="Filter by Role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md mb-3"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
              <option value="manager">Manager</option>
            </select>
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedRole("")}
                className="px-2 py-1 bg-red-400 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="px-2 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-300">Loading users...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                  USERNAME
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                  ROLE
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">
                  FULL NAME
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">
                  EMAIL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredUsers.map((user) => (
                <tr
                  key={user.user_id}
                  onClick={() => handleTableRowClick("user", user)}
                  className="hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-3 text-sm text-gray-300">{user.user_id}</td>
                  <td className="px-3 py-3 text-sm text-cyan-400 break-words">{user.username}</td>

                  <td className="px-3 py-3">
                    {user.roles && user.roles.length > 0 ? (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.roles[0] === "teacher"
                            ? "bg-orange-50 text-orange-800"
                            : user.roles[0] === "student"
                            ? "bg-green-50 text-green-800"
                            : user.roles[0] === "parent"
                            ? "bg-blue-50 text-blue-800"
                            : user.roles[0] === "manager"
                            ? "bg-purple-50 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.roles.map((r) => capitalizeFirstLetter(r)).join(", ")}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-cyan-500 text-gray-800">
                        User
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-300 break-words max-w-32">{user.full_name}</td>
                  <td className="px-3 py-3 text-sm text-cyan-400 break-words max-w-40">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
