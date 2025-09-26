"use client";

import * as React from "react";
import { Calendar, Filter } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../../showInfo/action_modal";
import { ShowInfoModal } from "../../showInfo/ShowInfoModal";
import { useSchedules } from "../../../../src/contexts/ScheduleContext";
import { CreateScheduleForm } from "./CreateScheduleForm";
import { Input } from "../../../../components/ui/input";
import { ConfirmModal } from "../../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../../src/hooks/useConfirmDialog";
import { useAuth } from "../../../../src/hooks/useAuth";

// Tên các filter/cột cho popover
type FilterKey = "class" | "day" | "room" | "date" | "type" | "start" | "end";

// Hàm định dạng ngày
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("vi-VN");
  } catch {
    return "-";
  }
};

export default function ScheduleManagement() {
  const { schedules, loading, removeSchedule } = useSchedules();
  const { isOpen, message, onConfirm, openConfirm, closeConfirm } =
    useConfirmDialog();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // === FILTER STATES ===
  const [openPopover, setOpenPopover] = React.useState<FilterKey | null>(null);
  const [filters, setFilters] = React.useState({
    class: "",
    day: "",
    room: "",
    date: "",
    type: "",
    start: "",
    end: "",
  });

  // Refs để định vị popover
  const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // === DATA OPTIONS ===
  const classOptions = React.useMemo(() => Array.from(new Set(schedules.map((s) => s.class_name).filter(Boolean))), [schedules]);
  const dayOptions = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
    "FRIDAY", "SATURDAY", "SUNDAY",
  ];
  const roomOptions = React.useMemo(() => Array.from(new Set(schedules.map((s) => s.room || "").filter(Boolean))), [schedules]);
  const typeOptions = ["WEEKLY", "ONCE"];
  
  // Time Options (Cần phải lọc ra từ schedules nếu muốn chính xác)
  const startTimeOptions = React.useMemo(() => Array.from(new Set(schedules.map((s) => s.start_time).filter(Boolean))).sort(), [schedules]);
  const endTimeOptions = React.useMemo(() => Array.from(new Set(schedules.map((s) => s.end_time).filter(Boolean))).sort(), [schedules]);

  // === FILTER LOGIC ===
  const filteredSchedules = React.useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch = (s.class_name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesDate = filters.date ? s.date === filters.date : true;

      return (
        matchesSearch &&
        (!filters.class || s.class_name === filters.class) &&
        (!filters.day || s.day_of_week === filters.day) &&
        (!filters.room || s.room === filters.room) &&
        matchesDate &&
        (!filters.type || s.schedule_type === filters.type) &&
        (!filters.start || s.start_time === filters.start) &&
        (!filters.end || s.end_time === filters.end)
      );
    });
  }, [schedules, searchTerm, filters]);

  // === HANDLERS ===
  const handleRowClick = (row: any) => {
    setSelectedRow(row);
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

  const handleFilterChange = (field: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setOpenPopover(null); // Đóng popover sau khi chọn
  };

  const resetFilters = React.useCallback(() => {
    setFilters({
      class: "",
      day: "",
      room: "",
      date: "",
      type: "",
      start: "",
      end: "",
    });
    setOpenPopover(null);
    setSearchTerm("");
  }, []);

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
    close: () => void
  ) => {
    if (e.target === e.currentTarget) close();
  };

  // Click outside to close popovers
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      // Chỉ đóng nếu click bên ngoài rootRef (hoặc bên ngoài popover)
      if (!rootRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);


  // Function to calculate popover position relative to the root div
  const getPopoverPosition = (filterName: FilterKey) => {
    const button = filterButtonRefs.current[filterName];
    if (!button || !rootRef.current) return { left: 0, top: 0, show: false };

    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();

    const top = buttonRect.bottom - rootRect.top + 5;
    const left = buttonRect.left - rootRect.left;

    // Điều chỉnh vị trí để popover không bị tràn bên phải
    let finalLeft = left;
    // Giả định chiều rộng popover là 200px (w-48)
    if (left + 200 > rootRect.width) {
        finalLeft = rootRect.width - 200;
    }
    if(finalLeft < 0) finalLeft = 0; // Tránh tràn bên trái

    return { left: finalLeft, top, show: openPopover === filterName };
  };

  if (loading) return <div className="text-gray-300">Đang tải lịch học...</div>;

  const headerItems: { label: string, key: FilterKey | "ID" }[] = [
    { label: "ID", key: "ID" },
    { label: "CLASS", key: "class" },
    { label: "DAY", key: "day" },
    { label: "ROOM", key: "room" },
    { label: "DATE", key: "date" },
    { label: "TYPE", key: "type" },
    { label: "START", key: "start" },
    { label: "END", key: "end" },
  ];

  return (
    <div className="space-y-4 relative" ref={rootRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Schedule Management
        </h2>
        {(user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            Create New Schedule
          </button>
        )}
      </div>

      {/* Search + Reset */}
      <div className="text-gray-900 flex items-center gap-4 mb-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
          />
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={resetFilters}
          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          Reset filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[700px] table-auto">
          <thead className="bg-gray-700">
            <tr>
              {headerItems.map((item) => (
                <th
                  key={item.key}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider relative"
                >
                  <div className="flex items-center gap-1">
                    <span>{item.label}</span>
                    {item.key !== "ID" && (
                      <button
                        ref={(el) => { filterButtonRefs.current[item.key] = el;}}
                        aria-label={`Filter by ${item.label}`}
                        onClick={() => {
                          if (item.key !== "ID") {
                            setOpenPopover(openPopover === item.key ? null : item.key as FilterKey);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <Filter className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {filteredSchedules.length > 0 ? (
                filteredSchedules.map((s) => (
                    <tr
                        key={s.id}
                        className="hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(s)}
                    >
                        <td className="px-3 py-3 text-sm text-gray-300">{s.id}</td>
                        <td className="px-3 py-3 text-sm text-cyan-400">{s.class_name}</td>
                        <td className="px-3 py-3 text-sm text-gray-300">{s.day_of_week || "-"}</td>
                        <td className="px-3 py-3 text-sm text-gray-300">{s.room}</td>
                        <td className="px-3 py-3 text-sm text-gray-300">{formatDate(s.date ?? "")}</td>
                        <td className="px-3 py-3">
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
                        <td className="px-3 py-3 text-sm text-gray-300">{s.start_time}</td>
                        <td className="px-3 py-3 text-sm text-gray-300">{s.end_time}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                        No schedules found matching your criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* POPUP FILTERS RENDERED HERE (outside the table) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* Class Filter */}
        {getPopoverPosition("class").show && (
          <FilterPopover
            name="class"
            position={getPopoverPosition("class")}
            value={filters.class}
            onChange={(e) => handleFilterChange("class", e.target.value)}
            options={classOptions}
          />
        )}
        
        {/* Day Filter */}
        {getPopoverPosition("day").show && (
          <FilterPopover
            name="day"
            position={getPopoverPosition("day")}
            value={filters.day}
            onChange={(e) => handleFilterChange("day", e.target.value)}
            options={dayOptions}
          />
        )}
        
        {/* Room Filter */}
        {getPopoverPosition("room").show && (
          <FilterPopover
            name="room"
            position={getPopoverPosition("room")}
            value={filters.room}
            onChange={(e) => handleFilterChange("room", e.target.value)}
            options={roomOptions}
          />
        )}

        {/* Date Filter (Input Type Date) */}
        {getPopoverPosition("date").show && (
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                    position: 'absolute',
                    top: getPopoverPosition("date").top,
                    left: getPopoverPosition("date").left,
                    // Căn chỉnh popover
                }}
                className="z-50 mt-2 w-48 bg-white border rounded shadow-lg p-3 text-gray-900"
            >
                <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">Date</label>
                <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </motion.div>
        )}

        {/* Type Filter */}
        {getPopoverPosition("type").show && (
          <FilterPopover
            name="type"
            position={getPopoverPosition("type")}
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            options={typeOptions}
          />
        )}
        
        {/* Start Time Filter */}
        {getPopoverPosition("start").show && (
          <FilterPopover
            name="start"
            position={getPopoverPosition("start")}
            value={filters.start}
            onChange={(e) => handleFilterChange("start", e.target.value)}
            options={startTimeOptions}
          />
        )}

        {/* End Time Filter */}
        {getPopoverPosition("end").show && (
          <FilterPopover
            name="end"
            position={getPopoverPosition("end")}
            value={filters.end}
            onChange={(e) => handleFilterChange("end", e.target.value)}
            options={endTimeOptions}
          />
        )}
      </AnimatePresence>


      {/* Modals */}
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
              userRoles={user?.roles}
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

      <ConfirmModal
        isOpen={isOpen}
        message={message}
        onConfirm={onConfirm}
        onCancel={closeConfirm}
      />

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
              userRoles={user?.roles}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              onCreated={async () => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterPopoverProps {
    name: string;
    position: { left: number; top: number; show: boolean };
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}

const FilterPopover: React.FC<FilterPopoverProps> = ({ name, position, value, onChange, options }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
            }}
            className="z-50 mt-2 w-48 bg-white border rounded shadow-lg p-3 text-gray-900"
        >
            <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">{name}</label>
            <select
                aria-label={`Select ${name} to filter`}
                value={value}
                onChange={onChange}
                className="w-full border p-2 rounded"
            >
                <option value="">All</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option || "(Empty)"}
                    </option>
                ))}
            </select>
        </motion.div>
    );
};