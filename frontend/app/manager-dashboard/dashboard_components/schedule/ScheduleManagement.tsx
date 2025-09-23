"use client";

import * as React from "react";
import { Calendar, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../../showInfo/action_modal";
import { ShowInfoModal } from "../../showInfo/ShowInfoModal";
import { useSchedules } from "../../../../src/contexts/ScheduleContext";
import { CreateScheduleForm } from "./CreateScheduleForm";
import { Input } from "../../../../components/ui/input";
import { ConfirmModal } from "../../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../../src/hooks/useConfirmDialog";
import { useAuth } from "../../../../src/hooks/useAuth";

export default function ScheduleManagement() {
  const { schedules, loading, removeSchedule } = useSchedules();
  const { isOpen, message, onConfirm, openConfirm, closeConfirm } =
    useConfirmDialog();
  const { user } = useAuth(); // Lấy thông tin user

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [filters, setFilters] = React.useState({
    class: "",
    day: "",
    room: "",
    date: "",
    type: "",
    start: "",
    end: "",
  });

  const classOptions = Array.from(new Set(schedules.map((s) => s.class_name)));
  const dayOptions = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const roomOptions = Array.from(new Set(schedules.map((s) => s.room || "")));
  const typeOptions = ["WEEKLY", "ONCE"];

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch = (s.class_name ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return (
      matchesSearch &&
      (!filters.class || s.class_name === filters.class) &&
      (!filters.day || s.day_of_week === filters.day) &&
      (!filters.room || s.room === filters.room) &&
      (!filters.date || s.date === filters.date) &&
      (!filters.type || s.schedule_type === filters.type) &&
      (!filters.start || s.start_time === filters.start) &&
      (!filters.end || s.end_time === filters.end)
    );
  });

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    // Kiểm tra nếu vai trò là 'manager' hoặc 'teacher'
    if (user?.roles.includes("manager") || user?.roles.includes("teacher")) {
      setShowAction(true);
    } else {
      setShowInfo(true);
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedRow) {
        await removeSchedule(selectedRow.id);
        setShowAction(false);
        closeConfirm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowInfo = () => {
    setShowAction(false);
    setShowInfo(true);
  };

  const handleCreated = async () => {};

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
    close: () => void
  ) => {
    if (e.target === e.currentTarget) close();
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      class: "",
      day: "",
      room: "",
      date: "",
      type: "",
      start: "",
      end: "",
    });
  };

  return (
     <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Schedule Management
        </h2>
        {/* Chỉ hiển thị nút Create nếu user là manager hoặc teacher */}
        {(user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            Create New Schedule
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="text-gray-900 flex items-center gap-4 mb-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button
          onClick={() => setShowFilterPanel((s) => !s)}
          className="px-4 py-2 bg-gray-500 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                value={filters.class}
                onChange={(e) => handleFilterChange("class", e.target.value)}
                className="p-2 border rounded"
                aria-label="Filter by class"
              >
                <option value="">Class</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filters.day}
                onChange={(e) => handleFilterChange("day", e.target.value)}
                className="p-2 border rounded"
                aria-label="Filter by day of the week"
              >
                <option value="">Day</option>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={filters.room ?? ""}
                onChange={(e) => handleFilterChange("room", e.target.value)}
                className="p-2 border rounded"
                aria-label="Filter by room"
              >
                <option value="">Room</option>
                {roomOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <Input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="p-2 border rounded"
              />

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="p-2 border rounded"
                aria-label="Filter by schedule type"
              >
                <option value="">Type</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <Input
                type="time"
                value={filters.start}
                onChange={(e) => handleFilterChange("start", e.target.value)}
                className="p-2 border rounded"
              />
              <Input
                type="time"
                value={filters.end}
                onChange={(e) => handleFilterChange("end", e.target.value)}
                className="p-2 border rounded"
              />

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        {loading ? (
          <p className="text-gray-300">Đang tải...</p>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-700">
              <tr>
                {["ID", "CLASS", "DAY", "ROOM", "DATE", "TYPE", "START", "END"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredSchedules.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(s)}
                >
                  <td className="px-2 py-3 text-sm text-gray-300">{s.id}</td>
                  <td className="px-2 py-3 text-sm text-cyan-400">
                    {s.class_name}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-300">
                    {s.day_of_week || "-"}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-300">{s.room}</td>
                  <td className="px-2 py-3 text-sm text-gray-300">
                    {s.date || "-"}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        s.schedule_type === "WEEKLY"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {s.schedule_type}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-300">
                    {s.start_time}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-300">
                    {s.end_time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Modal */}
      {/* Action Modal */}
      <AnimatePresence>
        {showAction && selectedRow && (user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowAction(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ActionModal
              onClose={() => setShowAction(false)}
              onShowInfo={handleShowInfo}
              userRoles={user?.roles} // Truyền roles vào ActionModal
              onDelete={
                user?.roles.includes("manager")
                  ? () => {
                      setShowAction(false);
                      openConfirm(
                        `Bạn có chắc chắn muốn xoá lịch ID ${selectedRow.id}?`,
                        handleDelete
                      );
                    }
                  : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isOpen}
        message={message}
        onConfirm={onConfirm}
        onCancel={closeConfirm}
      />

      {/* Show Info Modal */}
      <AnimatePresence>
        {showInfo && selectedRow && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowInfo(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ShowInfoModal
              type="schedule"
              data={selectedRow}
              onClose={() => setShowInfo(false)}
              onUpdated={async () => {}}
              userRoles={user?.roles} // Truyền roles vào ShowInfoModal
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Schedule Modal */}
      <AnimatePresence>
        {showCreateModal && (user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowCreateModal(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CreateScheduleForm
              onClose={() => setShowCreateModal(false)}
              onCreated={handleCreated}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Schedule Modal */}
      <AnimatePresence>
        {showCreateModal && (user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowCreateModal(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CreateScheduleForm
              onClose={() => setShowCreateModal(false)}
              onCreated={handleCreated}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}