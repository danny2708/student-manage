"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { usePayrolls } from "../../../src/hooks/usePayroll";
import { ActionModal} from "./action_modal";
import {
  Tuition,
  updateTuition,
  getTuitions,
  deleteTuition,
} from "../../../src/services/api/tuition";
import {
  Payroll,
  updatePayroll,
} from "../../../src/services/api/payroll";

// Định nghĩa lại các loại dữ liệu cho rõ ràng hơn
type ModalDataType = Tuition | Payroll;

interface ShowInfoModalProps {
  type: "tuition" | "payroll";
  data: ModalDataType;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

export function ShowInfoModal({
  type,
  data,
  onClose,
  onUpdated,
}: ShowInfoModalProps) {
  const [editedData, setEditedData] = useState<ModalDataType>(data);

  const handleInputChange = (field: string, value: string | number) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (type === "tuition") {
        const t = editedData as Tuition;
        const [d, m, y] = t.due_date.split("/");
        const formattedDate = `${y}-${m}-${d}`;

        const tuitionPayload = {
          amount: Number(t.amount),
          term: Number(t.term),
          due_date: formattedDate,
          payment_status: t.status,
        };
        await updateTuition(t.id, tuitionPayload);
      } else if (type === "payroll") {
        const p = editedData as Payroll;
        const updatedMonth = p.month ?? new Date(p.sent_at).getMonth() + 1;

        const payrollPayload = {
          month: updatedMonth,
          total_base_salary: p.base_salary,
          reward_bonus: p.bonus,
          sent_at: p.sent_at,
          status: p.status,
        };

        await updatePayroll(p.id, payrollPayload);
      }

      await onUpdated();
      onClose();
      alert("Lưu thành công!");
    } catch (err) {
      console.error("Failed to save data:", err);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  const renderFields = () => {
    if (type === "tuition") {
      const t = editedData as Tuition;
      return (
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="text-cyan-400 font-medium w-24 shrink-0">
              Student
            </span>
            <span className="text-white ml-6">{t.student}</span>
          </div>
          <div className="flex items-center">
            <span className="text-cyan-400 font-medium w-24 shrink-0">
              Term
            </span>
            <Input
              type="text"
              value={t.term}
              onChange={(e) => handleInputChange("term", Number(e.target.value))}
              className="w-48 ml-6"
            />
          </div>
          <div className="flex items-center">
            <span className="text-cyan-400 font-medium w-24 shrink-0">
              Amount
            </span>
            <Input
              type="text"
              value={t.amount}
              onChange={(e) =>
                handleInputChange("amount", Number(e.target.value))
              }
              className="w-48 ml-6"
            />
          </div>
          <div className="flex items-center">
            <span className="text-cyan-400 font-medium w-24 shrink-0">
              Status
            </span>
            <select
              value={t.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-48 ml-6"
              aria-label="Select status"
            >
              <option value="pending" className="text-black">
                Pending
              </option>
              <option value="paid" className="text-black">
                Paid
              </option>
              <option value="overdue" className="text-black">
                Overdue
              </option>
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-cyan-400 font-medium w-24 shrink-0">
              Due date
            </span>
            <Input
              type="date"
              value={
                t.due_date
                  ? (() => {
                      const [d, m, y] = t.due_date.split("/");
                      return `${y}-${m}-${d}`;
                    })()
                  : ""
              }
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-");
                handleInputChange("due_date", `${d}/${m}/${y}`);
              }}
              className="w-48 ml-6"
            />
          </div>
        </div>
      );
    } else if (type === "payroll") {
      const p = editedData as Payroll;
      const currentMonthValue = p.month ?? new Date(p.sent_at).getMonth() + 1;
      const calculatedTotal = (p.base_salary || 0) + (p.bonus || 0);

      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400 font-medium w-32 shrink-0">ID</span>
            <span className="text-white w-48 text-center">{p.id}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400 font-medium w-32 shrink-0">
              Teacher
            </span>
            <span className="text-white w-48 text-center">{p.teacher}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400 font-medium w-32 shrink-0">
              Month
            </span>
            <select
              value={currentMonthValue}
              onChange={(e) =>
                handleInputChange("month", Number(e.target.value))
              }
              className="w-48 text-white text-center bg-transparent border border-gray-600 rounded-md py-1"
              aria-label="Select month"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="text-black">
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400 font-medium w-32 shrink-0">
              Base Salary
            </span>
            <Input
              type="text"
              value={p.base_salary}
              onChange={(e) =>
                handleInputChange("base_salary", Number(e.target.value))
              }
              className="w-48 text-center"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400 font-medium w-32 shrink-0">
              Bonus
            </span>
            <Input
              type="text"
              value={p.bonus}
              onChange={(e) =>
                handleInputChange("bonus", Number(e.target.value))
              }
              className="w-48 text-center"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400 font-medium w-32 shrink-0">
              Total
            </span>
            <Input
              type="text"
              value={calculatedTotal}
              readOnly
              className="w-48 text-center"
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400 font-medium w-32 shrink-0">
              Status
            </span>
            <select
              value={p.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-48 text-white text-center bg-transparent border border-gray-600 rounded-md py-1"
              aria-label="Select status"
            >
              <option value="pending" className="text-black">
                Pending
              </option>
              <option value="paid" className="text-black">
                Paid
              </option>
            </select>
          </div>
        </div>
      );
    }
    return <div className="text-white">No information available</div>;
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl w-96 p-6 text-white relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>
      {renderFields()}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
}


export function ShowInfoFlow() {
  const { payrolls, fetchPayrolls, removePayroll } = usePayrolls();
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
        // Không cần gọi fetchPayrolls() ở đây vì hook đã tự cập nhật state
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