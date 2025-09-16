"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../../components/ui/input";

import { Payroll } from "../financial/payroll_modal";
import { Tuition } from "../financial/tuition_modal";
import { Schedule } from "../academic/schedule_modal";
import { Class } from "../academic/class_modal";

import {
  updateTuition,
  updateTuitionStatus,
} from "../../../src/services/api/tuition";
import { updatePayroll } from "../../../src/services/api/payroll";
import { ConfirmModal } from "../dashboard_components/ConfirmModal"; // <-- dùng component mới

type ModalDataType = Tuition | Payroll | Schedule | Class;

interface ShowInfoModalProps {
  type: string;
  data: ModalDataType;
  onClose: () => void;
  onUpdated?: () => Promise<void>;
}

export function ShowInfoModal({ type, data, onClose }: ShowInfoModalProps) {
  const [editedData, setEditedData] = useState(data);

  const handleInputChange = (field: string, value: string | number) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      
      if (type === "tuition") {
        const { id, amount, term, due_date, status } = editedData as Tuition;

        let formattedDate = due_date;
        if (due_date.includes("/")) {
          const [d, m, y] = due_date.split("/");
          formattedDate = `${y}-${m}-${d}`;
        }

        await updateTuition(id, {
          amount: Number(amount),
          term: Number(term),
          due_date: formattedDate,
        });

        if (status === "paid" || status === "pending" || status === "overdue") {
          await updateTuitionStatus(id, {
            payment_status: status as "paid" | "pending" | "overdue",
          });
        }
      } else if (type === "payroll") {
        const { id, ...payload } = editedData as Payroll;
        await updatePayroll(id, payload);
      }

      alert("Lưu thành công!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  const renderFields = () => {
    const currentData = editedData;

    const renderIdField = (id: string) => (
      <div className="flex items-center justify-between mb-4">
        <span className="text-cyan-400 font-medium">ID</span>
        <div className="flex-1 flex justify-center">
          <span className="text-white">{id}</span>
        </div>
      </div>
    );

    switch (type) {
      case "tuition":
        const tuitionData = currentData as Tuition;
        return (
          <>
            {renderIdField(String(tuitionData.id))}

            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Student name</span>
              <span className="text-white font-semibold px-3 py-2 rounded border-none w-48 text-left">
                {tuitionData.student || "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Term</span>
              <Input
                type="text"
                value={tuitionData.term || ""}
                onChange={(e) => handleInputChange("term", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Amount</span>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={tuitionData.amount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "amount",
                      e.target.value.replace(/[^\d]/g, "")
                    )
                  }
                  className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-36"
                />
                <span className="text-white">vnđ</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Status</span>
              <select
                aria-label="Status"
                value={tuitionData.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border outline-none w-48 rounded"
              >
                <option value="">-- Select status --</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-cyan-400 font-medium">Due date</span>
              <Input
                type="date"
                value={
                  tuitionData.due_date
                    ? (() => {
                        const [m, d, y] = tuitionData.due_date.split("/");
                        return `${y}-${m}-${d}`;
                      })()
                    : ""
                }
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-");
                  handleInputChange("due_date", `${d}/${m}/${y}`);
                }}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
          </>
        );
      default:
        return <div className="text-white">No information available</div>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-96 p-6 text-white relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="mt-2">
        {renderFields()}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShowInfoFlow({ rows }: { rows: any[] }) {
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleRowClick = (row: any, type: string) => {
    setSelectedRow(row);
    setSelectedType(type);
    setShowConfirm(true);
  };

  const handleShowInfo = () => {
    setShowConfirm(false);
    setShowInfo(true);
  };

  const handleDelete = async () => {
    alert(`Xoá ${selectedType} id=${selectedRow.id}`);
    setShowConfirm(false);
  };

  return (
    <div className="text-white">
      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => handleRowClick(row, row.type)}
              className="hover:bg-gray-700 cursor-pointer"
            >
              <td>{row.id}</td>
              <td>{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showConfirm && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <ConfirmModal
          onClose={() => setShowConfirm(false)}
          onShowInfo={handleShowInfo}
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
        />
      </div>
    )}
    </div>
  );
}
