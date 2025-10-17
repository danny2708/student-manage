"use client";

import { useState, useEffect } from "react";
import { usePayrolls } from "../../../src/hooks/usePayroll";
import { useSchedules } from "../../../src/contexts/ScheduleContext";
import { ActionModal } from "./action_modal";
import {
  Tuition,
  getTuitions,
  deleteTuition,
} from "../../../src/services/api/tuition";
import {
  Payroll,
  deletePayroll,
} from "../../../src/services/api/payroll";
import {
  Schedule,
  deleteSchedule,
} from "../../../src/services/api/schedule";
import { ShowInfoModal, ModalDataType } from "./ShowInfoModal";

export function ShowInfoFlow() {
  const { payrolls, fetchPayrolls } = usePayrolls();
  const { schedules, fetchSchedules } = useSchedules();

  const [tuitionRows, setTuitionRows] = useState<Tuition[]>([]);
  const [selectedRow, setSelectedRow] = useState<ModalDataType | null>(null);
  const [selectedType, setSelectedType] = useState<"tuition" | "payroll" | "schedule">("tuition");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const fetchTuitionData = async () => {
    try {
      const data = await getTuitions();
      setTuitionRows(data);
    } catch (error) {
      console.error("Failed to fetch tuitions:", error);
    }
  };

  useEffect(() => {
    fetchTuitionData();
    fetchPayrolls();
    fetchSchedules();
  }, []);

  const handleRowClick = (row: ModalDataType, type: "tuition" | "payroll" | "schedule") => {
    setSelectedRow(row);
    setSelectedType(type);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    try {
      if (selectedType === "tuition") {
        await deleteTuition((selectedRow as Tuition).id);
        await fetchTuitionData();
        alert("Tuition deleted successfully!");
      } else if (selectedType === "payroll") {
        await deletePayroll((selectedRow as Payroll).id);
        await fetchPayrolls();
        alert("Payroll deleted successfully!");
      } else if (selectedType === "schedule") {
        await deleteSchedule((selectedRow as Schedule).id);
        await fetchSchedules();
        alert("Schedule deleted successfully!");
      }
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  const handleUpdated = async () => {
    await fetchTuitionData();
    await fetchPayrolls();
    await fetchSchedules();
  };

  return (
    <div className="text-white">
      <h3 className="text-lg font-bold mb-2">Tuitions</h3>
      <table className="w-full mb-6">
        <thead>
          <tr><th>ID</th><th>Student</th></tr>
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
          <tr><th>ID</th><th>Teacher</th></tr>
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

      <h3 className="text-lg font-bold mb-2">Schedules</h3>
      <table className="w-full mb-6">
        <thead>
          <tr><th>ID</th><th>Class</th></tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr
              key={s.id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => handleRowClick(s, "schedule")}
            >
              <td>{s.id}</td>
              <td>{s.class_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Modal */}
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

      {/* Show Info Modal */}
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
