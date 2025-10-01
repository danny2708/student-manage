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
import { useAuth } from "../../../../src/contexts/AuthContext";

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

// === Filter Popover Component ===
interface FilterPopoverProps {
  name: string;
  position: { left: number; top: number; show: boolean };
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

const FilterPopover: React.FC<FilterPopoverProps> = ({ name, position, value, onChange, options }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    style={{ position: 'absolute', top: position.top, left: position.left }}
    className="z-50 mt-2 w-48 bg-white border rounded shadow-lg p-3 text-gray-900"
  >
    <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">{name}</label>
    <select
      aria-label={`Select ${name} to filter`}
      value={value}
      onChange={onChange}
      className="w-full border p-2 rounded text-gray-900"
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

// === MAIN COMPONENT ===
export default function ScheduleManagement() {
  const { schedules, loading, removeSchedule } = useSchedules();
  const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const [openPopover, setOpenPopover] = React.useState<FilterKey | null>(null);
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    class: "", day: "", room: "", date: "", type: "", start: "", end: "",
  });

  const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // Options
  const classOptions = React.useMemo(() => Array.from(new Set(schedules.map(s => s.class_name).filter(Boolean))), [schedules]);
  const dayOptions = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
  const roomOptions = React.useMemo(() => Array.from(new Set(schedules.map(s => s.room || "").filter(Boolean))), [schedules]);
  const typeOptions = ["WEEKLY","ONCE"];
  const startTimeOptions = React.useMemo(() => Array.from(new Set(schedules.map(s => s.start_time).filter(Boolean))).sort(), [schedules]);
  const endTimeOptions = React.useMemo(() => Array.from(new Set(schedules.map(s => s.end_time).filter(Boolean))).sort(), [schedules]);

  // Filtered Data
  const filteredSchedules = React.useMemo(() => schedules.filter(s => {
    const matchesSearch = (s.class_name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filters.date ? s.date === filters.date : true;
    return matchesSearch &&
      (!filters.class || s.class_name === filters.class) &&
      (!filters.day || s.day_of_week === filters.day) &&
      (!filters.room || s.room === filters.room) &&
      matchesDate &&
      (!filters.type || s.schedule_type === filters.type) &&
      (!filters.start || s.start_time === filters.start) &&
      (!filters.end || s.end_time === filters.end);
  }), [schedules, searchTerm, filters]);

  // Handlers
  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    if (user?.roles.includes("manager") || user?.roles.includes("teacher")) setShowAction(true);
    else setShowInfo(true);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    await removeSchedule(selectedRow.id);
    setShowAction(false);
    closeConfirm();
  };

  const handleFilterChange = (field: FilterKey, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setOpenPopover(null);
  };

  const resetFilters = React.useCallback(() => {
    setFilters({ class: "", day: "", room: "", date: "", type: "", start: "", end: "" });
    setOpenPopover(null);
    setSearchTerm("");
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>, close: () => void) => {
    if (e.target === e.currentTarget) close();
  };

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpenPopover(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const getPopoverPosition = (filterName: FilterKey) => {
    const button = filterButtonRefs.current[filterName];
    if (!button || !rootRef.current) return { left:0, top:0, show:false };
    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    let left = buttonRect.left - rootRect.left;
    const top = buttonRect.bottom - rootRect.top + 5;
    if (left + 200 > rootRect.width) left = rootRect.width - 200;
    if (left < 0) left = 0;
    return { left, top, show: openPopover === filterName };
  };

  if (loading) return <div className="text-gray-500">Loading schedules...</div>;

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
    <div className="space-y-4 relative p-4 bg-white text-gray-900" ref={rootRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule Management</h2>
        {(user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Create New Schedule
          </button>
        )}
      </div>

      {/* Search + Reset */}
      <div className="flex items-center gap-4 mb-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
          />
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={resetFilters}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[700px] table-auto bg-white">
          <thead className="bg-gray-100">
            <tr>
              {headerItems.map((item, index) => (
                <th
                  key={item.key}
                  className={`px-3 py-2 text-sm font-semibold text-gray-900 uppercase tracking-wider text-center ${
                    index !== headerItems.length - 1 ? "border-r border-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {item.label}
                    {item.key !== "ID" && (
                      <button
                        ref={(el) => {
                          filterButtonRefs.current[item.key] = el;
                        }}
                        onClick={() =>
                          setOpenPopover(
                            openPopover === item.key ? null : (item.key as FilterKey)
                          )
                        }
                        aria-label={`Filter by ${item.label}`}
                        title={`Filter by ${item.label}`}
                      >
                        <Filter
                          className={`h-4 w-4 cursor-pointer ${
                            openPopover === item.key ? "text-cyan-500" : "text-gray-900"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(s)}
                >
                  <td className="px-3 py-2 text-sm text-center border-r border-gray-200">{s.id}</td>
                  <td className="px-3 py-2 text-sm text-black text-center border-r border-gray-200">{s.class_name}</td>
                  <td className="px-3 py-2 text-sm text-center border-r border-gray-200">{s.day_of_week || "-"}</td>
                  <td className="px-3 py-2 text-sm text-center border-r border-gray-200">{s.room || "-"}</td>
                  <td className="px-3 py-2 text-sm text-center border-r border-gray-200">{formatDate(s.date || "")}</td>
                  <td className="px-3 py-2 text-center border-r border-gray-200">
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
                  <td className="px-3 py-2 text-sm text-center border-r border-gray-200">{s.start_time}</td>
                  <td className="px-3 py-2 text-sm text-center">{s.end_time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No schedules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {(["class","day","room","type","start","end"] as FilterKey[]).map(f => 
          getPopoverPosition(f).show && (
            <FilterPopover
              key={f}
              name={f}
              position={getPopoverPosition(f)}
              value={filters[f]}
              onChange={e => handleFilterChange(f, e.target.value)}
              options={
                f==="class"?classOptions:
                f==="day"?dayOptions:
                f==="room"?roomOptions:
                f==="type"?typeOptions:
                f==="start"?startTimeOptions:
                f==="end"?endTimeOptions:[]
              }
            />
          )
        )}
        {/* Date Filter */}
        {getPopoverPosition("date").show && (
          <motion.div
            initial={{ opacity:0,y:-6 }}
            animate={{ opacity:1,y:0 }}
            exit={{ opacity:0,y:-6 }}
            style={{position:'absolute', top:getPopoverPosition("date").top, left:getPopoverPosition("date").left}}
            className="z-50 mt-2 w-48 bg-white border rounded shadow-lg p-3 text-gray-900"
          >
            <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">Date</label>
            <Input
              type="date"
              value={filters.date}
              onChange={e => handleFilterChange("date", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAction && selectedRow && (user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={e => handleBackdropClick(e, () => setShowAction(false))}
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
          >
            <ActionModal
              onClose={() => setShowAction(false)}
              onShowInfo={() => {setShowAction(false); setShowInfo(true);}}
              userRoles={user?.roles}
              onDelete={user?.roles.includes("manager") ? () => {
                setShowAction(false);
                openConfirm(`Bạn có chắc chắn muốn xoá lịch ID ${selectedRow.id}?`, handleDelete);
              } : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal isOpen={isOpen} message={message} onConfirm={onConfirm} onCancel={closeConfirm} />

      <AnimatePresence>
        {showInfo && selectedRow && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={e => handleBackdropClick(e, () => setShowInfo(false))}
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
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
            onClick={e => handleBackdropClick(e, () => setShowCreateModal(false))}
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
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
