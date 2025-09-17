"use client";

import * as React from "react";
import { FileText, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../../showInfo/action_modal";
import { ShowInfoModal } from "../../showInfo/ShowInfoModal";
import { usePayrolls } from "../../../../src/hooks/usePayroll";
import { CreatePayrollForm } from "./CreatePayrollForm";

export default function PayrollManagement() {
  const { payrolls, fetchPayrolls, removePayroll } = usePayrolls();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // Filter UI states
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [baseMin, setBaseMin] = React.useState("");
  const [baseMax, setBaseMax] = React.useState("");
  const [bonusMin, setBonusMin] = React.useState("");
  const [bonusMax, setBonusMax] = React.useState("");
  const [totalMin, setTotalMin] = React.useState("");
  const [totalMax, setTotalMax] = React.useState("");

  // Lấy danh sách giáo viên duy nhất
  const teacherOptions = Array.from(new Set(payrolls.map((p) => p.teacher)));

  // Lọc payrolls theo toàn bộ tiêu chí
  const filteredPayrolls = payrolls.filter((p) => {
    const matchesSearch = (p.teacher ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTeacher = filterTeacher ? p.teacher === filterTeacher : true;
    const matchesStatus = filterStatus ? p.status === filterStatus : true;

    const matchesBase =
      (!baseMin || p.base_salary >= Number(baseMin)) &&
      (!baseMax || p.base_salary <= Number(baseMax));

    const matchesBonus =
      (!bonusMin || p.bonus >= Number(bonusMin)) &&
      (!bonusMax || p.bonus <= Number(bonusMax));

    const matchesTotal =
      (!totalMin || p.total >= Number(totalMin)) &&
      (!totalMax || p.total <= Number(totalMax));

    return (
      matchesSearch &&
      matchesTeacher &&
      matchesStatus &&
      matchesBase &&
      matchesBonus &&
      matchesTotal
    );
  });

  const formatCurrency = (amount: number) =>
    `${amount?.toLocaleString("en-US") || ""} vnđ`;

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setShowAction(true);
  };

  const handleDelete = async () => {
    try {
      if (selectedRow) {
        await removePayroll(selectedRow.id);
        alert("Xoá thành công!");
        setShowAction(false);
      }
    } catch (err) {
      console.error(err);
      alert("Xoá thất bại!");
    }
  };

  const handleShowInfo = () => {
    setShowAction(false);
    setShowInfo(true);
  };

  const handleCreated = async () => {
    await fetchPayrolls();
  };

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
    close: () => void
  ) => {
    if (e.target === e.currentTarget) close();
  };

  const resetFilters = () => {
    setFilterTeacher("");
    setFilterStatus("");
    setBaseMin("");
    setBaseMax("");
    setBonusMin("");
    setBonusMax("");
    setTotalMin("");
    setTotalMax("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
        >
          Create New Payroll
        </button>
      </div>

      {/* Search + Filter */}
      <div className="text-gray-900 flex items-center gap-4 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search payrolls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <FileText className="absolute left-3 top-2.5 h-5 w-5 text-black" />
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
              {/* Teacher */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Teacher</label>
                <select
                  aria-label="Filter by teacher"
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="">All</option>
                  {teacherOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Status</label>
                <select
                  aria-label="Filter by status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Base */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Base Salary</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={baseMin}
                    onChange={(e) => setBaseMin(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={baseMax}
                    onChange={(e) => setBaseMax(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {/* Bonus */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Bonus</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={bonusMin}
                    onChange={(e) => setBonusMin(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={bonusMax}
                    onChange={(e) => setBonusMax(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Total</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={totalMin}
                    onChange={(e) => setTotalMin(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={totalMax}
                    onChange={(e) => setTotalMax(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead className="bg-gray-700">
            <tr>
              {[
                "ID",
                "TEACHER",
                "BASE",
                "BONUS",
                "TOTAL",
                "STATUS",
                "SENT AT",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {filteredPayrolls.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleRowClick(p)}
              >
                <td className="px-3 py-3 text-sm text-gray-300">{p.id}</td>
                <td className="px-3 py-3 text-sm text-gray-300">{p.teacher}</td>
                <td className="px-3 py-3 text-sm text-gray-300">
                  {formatCurrency(p.base_salary)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">
                  {formatCurrency(p.bonus)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">
                  {formatCurrency(p.total)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      p.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">{p.sent_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
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
              onShowInfo={handleShowInfo}
              onDelete={handleDelete}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              type="payroll"
              data={selectedRow}
              onClose={() => setShowInfo(false)}
              onUpdated={fetchPayrolls}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Payroll Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowCreateModal(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CreatePayrollForm
              onClose={() => setShowCreateModal(false)}
              onCreated={handleCreated}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
