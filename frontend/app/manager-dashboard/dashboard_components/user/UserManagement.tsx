"use client";

import * as React from "react";
import { Users, Filter, Upload } from "lucide-react"; 
import { useUsers } from "../../../../src/contexts/UsersContext";
import ImportUsersModal from "./ImportUsersModal";
import { motion, AnimatePresence } from "framer-motion"; 

interface UserManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
  handleCreateNew: (type: string) => void;
  handleTableRowClick: (type: string, data: any) => void;
}

const ALL_ROLES = ["student", "teacher", "parent", "manager"];

export default function UserManagement({
  searchTerm,
  updateSearchTerm,
  handleCreateNew,
  handleTableRowClick,
}: UserManagementProps) {
  const { users, loading, error } = useUsers();
  const [selectedRole, setSelectedRole] = React.useState<string>("");
  const [showImportModal, setShowImportModal] = React.useState(false);

  // === POP OVER STATE & REFS ===
  const [showRolePopover, setShowRolePopover] = React.useState(false);
  const roleButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // === FILTER LOGIC ===
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole ? user.roles?.includes(selectedRole) : true;

    return matchesSearch && matchesRole;
  });

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setShowRolePopover(false); // Đóng popover sau khi chọn
  };

  // Click outside to close popover
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      // Nếu click bên ngoài root div, hoặc click vào bất kỳ đâu không phải popover
      if (
        !rootRef.current.contains(e.target as Node) &&
        e.target !== roleButtonRef.current
      ) {
        setShowRolePopover(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Tính toán vị trí popover
  const getPopoverPosition = () => {
    const button = roleButtonRef.current;
    if (!button || !rootRef.current) return { left: 0, top: 0, show: false };

    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();

    const top = buttonRect.bottom - rootRect.top + 5;
    const left = buttonRect.left - rootRect.left;

    return { left: left, top: top, show: showRolePopover };
  };

  return (
    // Thêm relative để định vị popover
    <div className="space-y-4 relative" ref={rootRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import from File
          </button>
          <button
            onClick={() => handleCreateNew("user")}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            Create New User
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="text-gray-900 flex items-center gap-3 mb-6 relative">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users by Username, Name, or Email..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("user", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
          />
          <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        {/* Nút Reset Filter chung */}
        {(selectedRole || searchTerm) && (
          <button
            onClick={() => {
              setSelectedRole("");
              updateSearchTerm("user", "");
            }}
            className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-300">Loading users...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[600px] table-auto">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                  USERNAME
                </th>
                {/* Cột ROLE với Filter Icon */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20 relative">
                  <div className="flex items-center gap-1">
                    ROLE
                    <button
                      ref={roleButtonRef}
                      aria-label="Filter by Role"
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
                        setShowRolePopover((s) => !s);
                      }}
                      className="cursor-pointer"
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    onClick={() => handleTableRowClick("user", user)}
                    className="hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-3 text-sm text-gray-300">
                      {user.user_id}
                    </td>
                    <td className="px-3 py-3 text-sm text-cyan-400 break-words">
                      {user.username}
                    </td>
                    <td className="px-3 py-3">
                      {user.roles && user.roles.length > 0 ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.roles[0] === "teacher"
                              ? "bg-orange-100 text-orange-800"
                              : user.roles[0] === "student"
                              ? "bg-green-100 text-green-800"
                              : user.roles[0] === "parent"
                              ? "bg-blue-100 text-blue-800"
                              : user.roles[0] === "manager"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.roles
                            .map((r) => capitalizeFirstLetter(r))
                            .join(", ")}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 break-words max-w-32">
                      {user.full_name}
                    </td>
                    <td className="px-3 py-3 text-sm text-cyan-400 break-words max-w-40">
                      {user.email}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE POPUP FILTER RENDERED HERE (outside the table, positioned absolutely) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {getPopoverPosition().show && (
          <RoleFilterPopover
            position={getPopoverPosition()}
            selectedValue={selectedRole}
            onSelect={handleRoleChange}
          />
        )}
      </AnimatePresence>
      
      <ImportUsersModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}

interface RoleFilterPopoverProps {
  position: { left: number; top: number; show: boolean };
  selectedValue: string;
  onSelect: (role: string) => void;
}

const RoleFilterPopover: React.FC<RoleFilterPopoverProps> = ({
  position,
  selectedValue,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
      className="z-50 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-xl p-3 text-gray-900"
    >
      <h4 className="font-semibold mb-2 text-gray-800 text-sm">Filter by Role</h4>
      <select
        aria-label="Filter by Role"
        value={selectedValue}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 focus:ring-cyan-500 focus:border-cyan-500"
      >
        <option value="">All Roles</option>
        {ALL_ROLES.map((role) => (
          <option key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </option>
        ))}
      </select>
      <button
        onClick={() => onSelect("")}
        className="w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer text-sm"
      >
        Clear Filter
      </button>
    </motion.div>
  );
};