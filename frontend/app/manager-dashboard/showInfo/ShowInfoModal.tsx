"use client";

import { useState, useCallback, useEffect } from "react";
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
import {
  Schedule,
  updateSchedule,
  ScheduleUpdate,
} from "../../../src/services/api/schedule";

import { PayrollInfoForm } from "./PayrollInfoForm";
import { TuitionInfoForm } from "./TuitionInfoForm";
import { ClassInfoForm } from "./ClassInfoForm";
import { ScheduleInfoForm } from "./ScheduleInfoForm"; 

export type ModalDataType = Tuition | Payroll | Class | Schedule;
export type ModalType = "tuition" | "payroll" | "class" | "schedule";

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

  // Khi mở modal, nếu có schedule.date dạng yyyy-mm-dd thì convert sang dd/mm/yyyy để hiển thị cho người dùng
  useEffect(() => {
    if (type === "schedule") {
      const s = data as Schedule;
      if (s.date && s.date.includes("-")) {
        const [y, m, d] = s.date.split("-");
        setEditedData({ ...s, date: `${d}/${m}/${y}` });
      }
    }
    if (type === "tuition") {
      const t = data as Tuition;
      if (t.due_date && t.due_date.includes("-")) {
        const [y, m, d] = t.due_date.split("-");
        setEditedData({ ...t, due_date: `${d}/${m}/${y}` });
      }
    }
  }, [type, data]);

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
        await updateTuition(t.id, {
          amount: Number(t.amount),
          term: Number(t.term),
          due_date: formattedDate,
          status: t.status,
        });
      } else if (type === "payroll") {
        const p = editedData as Payroll;
        const updatedMonth =
          p.month !== undefined && p.month !== null
            ? Number(p.month)
            : new Date(p.sent_at).getMonth();
        await updatePayroll(p.id, {
          month: updatedMonth,
          total_base_salary: Number((p as any).total_base_salary ?? 0),
          reward_bonus: Number((p as any).reward_bonus ?? 0),
          sent_at: new Date(p.sent_at).toISOString(),
          status: p.status,
        });
      } else if (type === "class") {
        const c = editedData as Class;
        const classPayload: ClassUpdate = {
          class_name: c.class_name,
          capacity: c.capacity,
          fee: c.fee,
        };
        if ((editedData as any).teacher_user_id !== undefined) {
          (classPayload as any).teacher_user_id = (editedData as any).teacher_user_id;
        }
        await updateClass(c.class_id, classPayload);
      } else if (type === "schedule") {
        const s = editedData as Schedule;

        const payload: ScheduleUpdate = {
          class_id: s.class_id,
          room: s.room,
          schedule_type: s.schedule_type,
          start_time: s.start_time,
          end_time: s.end_time,
        };

        if (s.schedule_type === "ONCE" && s.date) {
          // convert dd/mm/yyyy -> yyyy-mm-dd để gửi API
          const parts = s.date.includes("/") ? s.date.split("/") : null;
          const formattedDate = parts ? `${parts[2]}-${parts[1]}-${parts[0]}` : s.date;
          payload.date = formattedDate;
          const day = new Date(formattedDate).toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
          payload.day_of_week = day as any;
        } else if (s.schedule_type === "WEEKLY" && s.day_of_week) {
          payload.day_of_week = s.day_of_week;
        }

        await updateSchedule(s.id, payload);
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
      return <TuitionInfoForm data={editedData as Tuition} onInputChange={handleInputChange} />;
    }
    if (type === "payroll") {
      return <PayrollInfoForm data={editedData as Payroll} onInputChange={handleInputChange} />;
    }
    if (type === "class") {
      return <ClassInfoForm data={editedData as Class} onInputChange={handleInputChange} />;
    }
    if (type === "schedule") {
      return <ScheduleInfoForm data={editedData as Schedule} onInputChange={handleInputChange} />;
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
        {type === "tuition"
          ? "học phí"
          : type === "payroll"
          ? "bảng lương"
          : type === "class"
          ? "lớp học"
          : "lịch học"}
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
