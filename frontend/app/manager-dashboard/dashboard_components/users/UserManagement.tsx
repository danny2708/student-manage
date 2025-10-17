"use client";

import * as React from "react";
import { Users, Filter, Upload } from "lucide-react"; 
import { useUsers } from "../../../../src/contexts/UsersContext";
import ImportUsersModal from "./ImportUsersModal";
import { motion, AnimatePresence } from "framer-motion"; 
import { Button } from "../../../../components/ui/button";

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

  const [showRolePopover, setShowRolePopover] = React.useState(false);
  const roleButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? user.roles?.includes(selectedRole) : true;
    return matchesSearch && matchesRole;
  });

  const capitalizeFirstLetter = (string: string) =>
    string ? string.charAt(0).toUpperCase() + string.slice(1) : "";

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setShowRolePopover(false);
  };

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node) && e.target !== roleButtonRef.current) {
        setShowRolePopover(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const getPopoverPosition = () => {
    const button = roleButtonRef.current;
    if (!button || !rootRef.current) return { left: 0, top: 0, show: false };
    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    return { left: buttonRect.left - rootRect.left, top: buttonRect.bottom - rootRect.top + 5, show: showRolePopover };
  };

  return (
    <div className="space-y-6 relative p-4 bg-white rounded-lg shadow-lg" ref={rootRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-black">User Management</h2>
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="w-4 h-4" /> Import from File
          </Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => handleCreateNew("user")}>
            Create New User
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users by Username, Name, or Email..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("user", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
          />
          <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        {(selectedRole || searchTerm) && (
          <Button
            variant="destructive"
            className="px-3 py-1 text-sm"
            onClick={() => {
              setSelectedRole("");
              updateSearchTerm("user", "");
            }}
          >
            Reset filter
          </Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full min-w-[600px] table-auto">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-16">ID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-24">USERNAME</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-20 relative">
                  <div className="flex items-center gap-3">
                    ROLE
                    <button
                      aria-label="Filter by Role"
                      ref={roleButtonRef}
                      onClick={(e) => { e.stopPropagation(); setShowRolePopover((s) => !s); }}
                      className="cursor-pointer"
                    >
                      <Filter className="h-4 w-4 text-black" />
                    </button>
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-32">FULL NAME</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-40">EMAIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    onClick={() => handleTableRowClick("user", user)}
                    className="hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-3 text-sm text-black border-r border-gray-200">{user.user_id}</td>
                    <td className="px-3 py-3 text-sm text-black break-words border-r border-gray-200">{user.username}</td>
                    <td className="px-3 py-3 border-r border-gray-200">
                      {user.roles && user.roles.length > 0 ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.roles[0] === "teacher" ? "bg-orange-100 text-orange-800" :
                          user.roles[0] === "student" ? "bg-green-100 text-green-800" :
                          user.roles[0] === "parent" ? "bg-blue-100 text-blue-800" :
                          user.roles[0] === "manager" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {user.roles.map(capitalizeFirstLetter).join(", ")}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-black">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-black break-words border-r border-gray-200">{user.full_name}</td>
                    <td className="px-3 py-3 text-sm text-black break-words">{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">No users found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ROLE POPUP */}
      <AnimatePresence>
        {getPopoverPosition().show && (
          <RoleFilterPopover
            position={getPopoverPosition()}
            selectedValue={selectedRole}
            onSelect={handleRoleChange}
          />
        )}
      </AnimatePresence>

      {/* Import Users Modal */}
      <ImportUsersModal open={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
}

interface RoleFilterPopoverProps {
  position: { left: number; top: number; show: boolean };
  selectedValue: string;
  onSelect: (role: string) => void;
}

const RoleFilterPopover: React.FC<RoleFilterPopoverProps> = ({ position, selectedValue, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      style={{ position: "absolute", top: position.top, left: position.left }}
      className="z-50 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-black"
    >
      <h4 className="font-semibold mb-2 text-sm">Filter by Role</h4>
      <select
        aria-label="Filter by Role"
        value={selectedValue}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 focus:ring-cyan-500 focus:border-cyan-500"
      >
        <option value="">All Roles</option>
        {ALL_ROLES.map((role) => (
          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
        ))}
      </select>
      <Button
        variant="destructive"
        className="w-full px-2 py-1 text-sm mt-1"
        onClick={() => onSelect("")}
      >
        Clear Filter
      </Button>
    </motion.div>
  );
};
