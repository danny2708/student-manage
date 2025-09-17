// components/dashboard_components/ShowInfoFlow.tsx
"use client";

import { useState, useEffect } from "react";
import { usePayrolls } from "../../src/hooks/usePayroll";
import { ActionModal } from "./action_modal";
import {
  Tuition,
  getTuitions,
  deleteTuition,
} from "../../src/services/api/tuition";
import {
  Payroll,
  updatePayroll,
  removePayroll,
} from "../../src/services/api/payroll";
import { ShowInfoModal, ModalDataType } from "./ShowInfoModal"; // Import component đã được cập nhật

export function ShowInfoFlow() {
  const { payrolls, fetchPayrolls } = usePayrolls();
  const [tuitionRows, setTuitionRows] = useState<Tuition[]>([]);
  const [selectedRow, setSelectedRow] = useState<ModalDataType | null>(null);
  const [selectedType, setSelectedType] = useState<"tuition" | "payroll">(
    "tuition"
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const reloadTuitionData = async () => {
    const data = await getTuitions();
    setTuitionRows(data);
  };

  useEffect(() => {
    reloadTuitionData();
    fetchPayrolls();
  }, [fetchPayrolls]);

  const handleRowClick = (row: ModalDataType, type: "tuition" | "payroll") => {
    setSelectedRow(row);
    setSelectedType(type);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      if (!selectedRow) return;

      if (selectedType === "tuition") {
        await deleteTuition((selectedRow as Tuition).id);
        alert("Tuition deleted successfully!");
        await reloadTuitionData();
      } else if (selectedType === "payroll") {
        await removePayroll((selectedRow as Payroll).id);
        alert("Payroll deleted successfully!");
      }

      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  const handleUpdated = async () => {
    await reloadTuitionData();
    await fetchPayrolls();
  };

  return (
    <div className="text-white">
      {/* ... (phần bảng hiển thị học phí và bảng lương giữ nguyên) */}

      <h3 className="text-lg font-bold mb-2">Tuitions</h3>
      <table className="w-full mb-6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
          </tr>
        </thead>
        <tbody>
          {tuitionRows.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => handleRowClick(t, "tuition")}
            >
              <td>{t.id}</td>
              <td>{t.student}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-bold mb-2">Payrolls</h3>
      <table className="w-full mb-6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Teacher</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => handleRowClick(p, "payroll")}
            >
              <td>{p.id}</td>
              <td>{p.teacher}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showConfirm && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <ActionModal
            onClose={() => setShowConfirm(false)}
            onShowInfo={() => {
              setShowConfirm(false);
              setShowInfo(true);
            }}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showInfo && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <ShowInfoModal
            type={selectedType}
            data={selectedRow}
            onClose={() => setShowInfo(false)}
            onUpdated={handleUpdated}
          />
        </div>
      )}
    </div>
  );
}