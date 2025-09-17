"use client";

import * as React from "react";
import { FileText, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../../functions/action_modal";
import { ShowInfoModal } from "../../functions/show_info_modal";
import { useTuitions } from "../../../../src/hooks/useTuition";
import { CreateTuitionForm } from "./CreateTuitionForm";

export default function TuitionManagement() {
  const { tuitions, fetchTuitions, removeTuition } = useTuitions();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // Filter states
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [filterStudent, setFilterStudent] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [amountMin, setAmountMin] = React.useState("");
  const [amountMax, setAmountMax] = React.useState("");
  const [termMin, setTermMin] = React.useState("");
  const [termMax, setTermMax] = React.useState("");

  const studentOptions = Array.from(new Set(tuitions.map((t) => t.student)));

  const filteredTuitions = tuitions.filter((t) => {
    const matchesSearch = (t.student ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStudent = filterStudent ? t.student === filterStudent : true;
    const matchesStatus = filterStatus ? t.status === filterStatus : true;

    const matchesAmount =
      (!amountMin || t.amount >= Number(amountMin)) &&
      (!amountMax || t.amount <= Number(amountMax));

    const matchesTerm =
      (!termMin || t.term >= Number(termMin)) &&
      (!termMax || t.term <= Number(termMax));

    return (
      matchesSearch &&
      matchesStudent &&
      matchesStatus &&
      matchesAmount &&
      matchesTerm
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
        await removeTuition(selectedRow.id);
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
    await fetchTuitions();
  };

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
    close: () => void
  ) => {
    if (e.target === e.currentTarget) close();
  };

  const resetFilters = () => {
    setFilterStudent("");
    setFilterStatus("");
    setAmountMin("");
    setAmountMax("");
    setTermMin("");
    setTermMax("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tuition Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
        >
          Create New Tuition
        </button>
      </div>

      {/* Search + Filter */}
      <div className="text-gray-900 flex items-center gap-4 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tuitions..."
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
              {/* Student */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Student</label>
                <select
                  aria-label="Filter by student"
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="">All</option>
                  {studentOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
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
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={amountMin}
                    onChange={(e) => setAmountMin(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={amountMax}
                    onChange={(e) => setAmountMax(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {/* Term */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Term</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={termMin}
                    onChange={(e) => setTermMin(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={termMax}
                    onChange={(e) => setTermMax(e.target.value)}
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
                "STUDENT",
                "AMOUNT",
                "TERM",
                "STATUS",
                "DUE DATE",
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
            {filteredTuitions.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleRowClick(t)}
              >
                <td className="px-3 py-3 text-sm text-gray-300">{t.id}</td>
                <td className="px-3 py-3 text-sm text-gray-300">{t.student}</td>
                <td className="px-3 py-3 text-sm text-gray-300">
                  {formatCurrency(t.amount)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">{t.term}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      t.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">{t.due_date}</td>
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
              type="tuition"
              data={selectedRow}
              onClose={() => setShowInfo(false)}
              onUpdated={fetchTuitions}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Tuition Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) =>
              handleBackdropClick(e, () => setShowCreateModal(false))
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CreateTuitionForm
              onClose={() => setShowCreateModal(false)}
              onCreated={handleCreated}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
