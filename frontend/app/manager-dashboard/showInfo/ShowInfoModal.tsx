// components/functions/ShowInfoModal.tsx
"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tuition,
  updateTuition,
} from "../../../src/services/api/tuition";
import {
  Payroll,
  updatePayroll,
} from "../../../src/services/api/payroll";
import {
  Class,
  updateClass,
  ClassUpdate,
} from "../../../src/services/api/class";
import { PayrollInfoForm } from "./PayrollInfoForm";
import { TuitionInfoForm } from "./TuitionInfoForm";
import { ClassInfoForm } from "./ClassInfoForm";

export type ModalDataType = Tuition | Payroll | Class;
export type ModalType = "tuition" | "payroll" | "class";

interface ShowInfoModalProps {
  type: ModalType;
  data: ModalDataType;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  extraActions?: React.ReactNode;
}

export function ShowInfoModal({
  type,
  data,
  onClose,
  onUpdated,
}: ShowInfoModalProps) {
  const [editedData, setEditedData] = useState<ModalDataType>(data);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = useCallback(
    (field: string, value: string | number | undefined) => {
      setEditedData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSave = async () => {
    setIsSaving(true);
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
      } else if (type === "class") {
        const c = editedData as Class;
        // Construct payload carefully from available properties
        const classPayload: ClassUpdate = {
          class_name: c.class_name,
          capacity: c.capacity,
          fee: c.fee,
        };
        // Check and include teacher_user_id if it exists in data
        // Giả sử `teacher_user_id` được thêm vào `Class` hoặc được quản lý ở một state riêng.
        // Với cấu trúc hiện tại, chúng ta không thể truy cập `teacher_user_id` từ `Class`.
        // Cần truyền `teacher_user_id` riêng hoặc thay đổi kiểu `Class` để bao gồm nó.
        // Hướng giải quyết tạm thời là bỏ qua nó hoặc sử dụng lại từ payload ban đầu nếu có.
        // Dưới đây là giải pháp tốt hơn: thêm nó vào payload nếu có.
        if ((editedData as any).teacher_user_id !== undefined) {
             (classPayload as any).teacher_user_id = (editedData as any).teacher_user_id;
        }

        await updateClass(c.class_id, classPayload);
      }
      await onUpdated();
      onClose();
      alert("Lưu thành công!");
    } catch (err) {
      console.error("Failed to save data:", err);
      alert("Có lỗi xảy ra khi lưu!");
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (type === "tuition") {
      return (
        <TuitionInfoForm data={editedData as Tuition} onInputChange={handleInputChange} />
      );
    }
    if (type === "payroll") {
      return (
        <PayrollInfoForm data={editedData as Payroll} onInputChange={handleInputChange} />
      );
    }
    if (type === "class") {
        return (
            <ClassInfoForm data={editedData as Class} onInputChange={handleInputChange} />
        );
    }
    return <div className="text-white">Không có thông tin để hiển thị.</div>;
  };

  return (
    <motion.div
      className="bg-gray-900 rounded-lg shadow-xl w-96 p-6 text-white relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>
      <h2 className="text-xl font-bold mb-4 text-center">
        Chi tiết{" "}
        {type === "tuition" ? "học phí" : type === "payroll" ? "bảng lương" : "lớp học"}
      </h2>
      {renderContent()}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </motion.div>
  );
}