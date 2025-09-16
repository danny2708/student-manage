"use client";

import * as React from "react";
import { FileText, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../../functions/action_modal";
import { ShowInfoModal } from "../../functions/show_info_modal";
import { usePayrolls } from "../../../../src/hooks/usePayroll";
import { CreatePayrollForm } from "./CreatePayrollForm";

export default function PayrollManagement() {
  const { payrolls, fetchPayrolls, removePayroll } = usePayrolls();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const filteredPayrolls = payrolls.filter((p) =>
    (p.teacher ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>, close: () => void) => {
    if (e.target === e.currentTarget) close();
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
      <div className="text-gray-900 flex items-center gap-4 mb-6">
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
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer">
          <Settings className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                TEACHER
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                BASE
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                BONUS
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                TOTAL
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                SENT AT
              </th>
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
                <td className="px-3 py-3 text-sm text-gray-300">{formatCurrency(p.base_salary)}</td>
                <td className="px-3 py-3 text-sm text-gray-300">{formatCurrency(p.bonus)}</td>
                <td className="px-3 py-3 text-sm text-gray-300">{formatCurrency(p.total)}</td>
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
