"use client";

import * as React from "react";
import { FileText, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../../showInfo/action_modal";
import { ShowInfoModal } from "../../showInfo/ShowInfoModal";
import { ConfirmModal } from "../../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../../src/hooks/useConfirmDialog";
import { useTuitions } from "../../../../src/hooks/useTuition";
import { CreateTuitionForm } from "./CreateTuitionForm";
import { Input } from "../../../../components/ui/input";
import { useAuth } from "../../../../src/contexts/AuthContext";

type FilterKey = "student" | "status" | "amount" | "term";
interface PopoverPosition { left: number; top: number; show: boolean }

interface FilterPopoverProps {
  name: string;
  position: PopoverPosition;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  name, position, value, onChange, options
}) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    style={{ position: "absolute", top: position.top, left: position.left }}
    className="z-50 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-black"
  >
    <label className="text-sm font-semibold mb-2 block capitalize">{name}</label>
    <select
      aria-label={`Select ${name} to filter`}
      value={value}
      onChange={onChange}
      className="w-full border p-2 text-sm rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>{option || "(Empty)"}</option>
      ))}
    </select>
  </motion.div>
);

interface RangeFilterPopoverProps {
  name: string;
  position: PopoverPosition;
  min: string;
  max: string;
  setMin: (value: string) => void;
  setMax: (value: string) => void;
  onApply: () => void;
}

const RangeFilterPopover: React.FC<RangeFilterPopoverProps> = ({
  name, position, min, max, setMin, setMax, onApply
}) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    style={{ position: "absolute", top: position.top, left: position.left }}
    className="z-50 mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-black space-y-2"
  >
    <label className="text-sm font-semibold block capitalize">{name}</label>
    <Input
      type="number" placeholder="Min"
      value={min} onChange={(e) => setMin(e.target.value)}
      className="w-full border p-2 text-sm rounded"
    />
    <Input
      type="number" placeholder="Max"
      value={max} onChange={(e) => setMax(e.target.value)}
      className="w-full border p-2 text-sm rounded"
    />
    <button
      onClick={onApply}
      className="w-full mt-2 px-2 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
    >
      Apply
    </button>
  </motion.div>
);

export default function TuitionManagement() {
  const { user } = useAuth();
  const { tuitions, fetchTuitions, removeTuition } = useTuitions();
  const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const [filterStudent, setFilterStudent] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [amountMin, setAmountMin] = React.useState("");
  const [amountMax, setAmountMax] = React.useState("");
  const [termMin, setTermMin] = React.useState("");
  const [termMax, setTermMax] = React.useState("");
  const [openPopover, setOpenPopover] = React.useState<FilterKey | null>(null);

  const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => { fetchTuitions(); }, [fetchTuitions]);

  const studentOptions = Array.from(new Set(tuitions.map((t) => t.student).filter(Boolean)));
  const statusOptions = ["paid", "unpaid"];

  const filteredTuitions = tuitions.filter((t) => {
    const matchesSearch = (t.student ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStudent = filterStudent ? t.student === filterStudent : true;
    const matchesStatus = filterStatus ? t.status === filterStatus : true;
    const matchesAmount =
      (!amountMin || t.amount >= Number(amountMin)) &&
      (!amountMax || t.amount <= Number(amountMax));
    const matchesTerm =
      (!termMin || t.term >= Number(termMin)) &&
      (!termMax || t.term <= Number(termMax));

    return matchesSearch && matchesStudent && matchesStatus && matchesAmount && matchesTerm;
  });

  const formatCurrency = (amount: number) => `${amount?.toLocaleString("en-US") || ""} vnđ`;

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    if (user?.roles.includes("manager") || user?.roles.includes("teacher")) {
      setShowAction(true);
    } else {
      setShowInfo(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    try {
      await removeTuition(selectedRow.id);
      closeConfirm();
      setShowAction(false);
      await fetchTuitions();
    } catch {
      alert("Xoá thất bại!");
    }
  };

  const resetFilters = React.useCallback(() => {
    setFilterStudent(""); setFilterStatus("");
    setAmountMin(""); setAmountMax("");
    setTermMin(""); setTermMax("");
    setSearchTerm(""); setOpenPopover(null);
  }, []);

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
    if (!button || !rootRef.current) return { left: 0, top: 0, show: false };

    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    const top = buttonRect.bottom - rootRect.top + 5;
    let left = buttonRect.left - rootRect.left;

    const popoverWidth = 208;
    if (left + popoverWidth > rootRect.width) left = rootRect.width - popoverWidth;
    if (left < 0) left = 0;

    return { left, top, show: openPopover === filterName };
  };

  const headerItems: { label: string, key: FilterKey | "ID" | "DUE DATE" }[] = [
    { label: "ID", key: "ID" },
    { label: "STUDENT", key: "student" },
    { label: "AMOUNT", key: "amount" },
    { label: "TERM", key: "term" },
    { label: "STATUS", key: "status" },
    { label: "DUE DATE", key: "DUE DATE" },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>, close: () => void) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div className="space-y-6 relative p-4 bg-white rounded-lg shadow-lg" ref={rootRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">Tuition Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Create New Tuition
        </button>
      </div>

      {/* Search + Reset */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search tuitions by student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
          />
          <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={resetFilters}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200 shadow-sm mt-4">
        <table className="w-full min-w-[650px] table-auto border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              {headerItems.map((item, index) => (
                <th
                  key={item.key}
                  className={`px-3 py-3 text-sm font-semibold text-black uppercase tracking-wider text-center ${
                    index !== headerItems.length - 1 ? "border-r border-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{item.label}</span>
                    {["student","status","amount","term"].includes(item.key as string) && (
                      <button
                        ref={(el) => { filterButtonRefs.current[item.key as FilterKey] = el; }}
                        onClick={() => setOpenPopover(openPopover === item.key ? null : item.key as FilterKey)}
                        className="cursor-pointer"
                        aria-label={`Filter by ${item.label}`}
                        title={`Filter by ${item.label}`}
                      >
                        <Filter className={`h-4 w-4 ${openPopover === item.key ? "text-cyan-500" : "text-gray-900"}`} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTuitions.length > 0 ? filteredTuitions.map((t: any) => (
              <tr
                key={t.id}
                className="hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleRowClick(t)}
              >
                <td className="px-3 py-3 text-sm text-center border-r border-gray-200">{t.id}</td>
                <td className="px-3 py-3 text-sm text-center border-r border-gray-200">{t.student}</td>
                <td className="px-3 py-3 text-sm text-center border-r border-gray-200">{formatCurrency(t.amount)}</td>
                <td className="px-3 py-3 text-sm text-center border-r border-gray-200">{t.term}</td>
                <td className="px-3 py-3 text-center border-r border-gray-200">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    t.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>{t.status}</span>
                </td>
                <td className="px-3 py-3 text-sm text-center">{t.due_date}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No tuitions found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Filter Popovers */}
      <AnimatePresence>
        {getPopoverPosition("student").show && (
          <FilterPopover
            name="Student"
            position={getPopoverPosition("student")}
            value={filterStudent}
            onChange={(e) => { setFilterStudent(e.target.value); setOpenPopover(null); }}
            options={studentOptions}
          />
        )}
        {getPopoverPosition("status").show && (
          <FilterPopover
            name="Status"
            position={getPopoverPosition("status")}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setOpenPopover(null); }}
            options={statusOptions}
          />
        )}
        {getPopoverPosition("amount").show && (
          <RangeFilterPopover
            name="Amount"
            position={getPopoverPosition("amount")}
            min={amountMin} max={amountMax}
            setMin={setAmountMin} setMax={setAmountMax}
            onApply={() => setOpenPopover(null)}
          />
        )}
        {getPopoverPosition("term").show && (
          <RangeFilterPopover
            name="Term"
            position={getPopoverPosition("term")}
            min={termMin} max={termMax}
            setMin={setTermMin} setMax={setTermMax}
            onApply={() => setOpenPopover(null)}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAction && selectedRow && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowAction(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ActionModal
              onClose={() => setShowAction(false)}
              onShowInfo={() => { setShowAction(false); setShowInfo(true); }}
              onDelete={user?.roles.includes("manager") ? () => openConfirm(
                `Bạn có chắc chắn muốn xoá tuition ${selectedRow.id}?`, handleDelete
              ) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              type="tuition"
              data={selectedRow}
              onClose={() => setShowInfo(false)}
              onUpdated={async () => { await fetchTuitions(); }}
              userRoles={user?.roles}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowCreateModal(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CreateTuitionForm
              onClose={() => setShowCreateModal(false)}
              onCreated={async () => { await fetchTuitions(); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal isOpen={isOpen} message={message} onConfirm={onConfirm} onCancel={closeConfirm} />
    </div>
  );
}
