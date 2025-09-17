"use client";

import { useState, ChangeEvent } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../../../../components/ui/input";
import { useUsers, User } from "../../../../src/contexts/UsersContext";
import { createPayroll, PayrollCreate } from "../../../../src/services/api/payroll";

interface CreatePayrollFormProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export function CreatePayrollForm({
  onClose,
  onCreated,
}: CreatePayrollFormProps) {
  const { users, loading } = useUsers();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [month, setMonth] = useState("");

  const [baseSalaryDisplay, setBaseSalaryDisplay] = useState("");
  const [baseSalaryValue, setBaseSalaryValue] = useState(0);

  const [bonusDisplay, setBonusDisplay] = useState("");
  const [bonusValue, setBonusValue] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");

  // Filter only teachers
  const teachers: User[] = users.filter((user) => user.roles?.includes("teacher"));

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    setDisplay: (s: string) => void,
    setValue: (n: number) => void
  ) => {
    const raw = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(raw)) {
      setDisplay(raw);
      setValue(Number(raw || 0));
    }
  };

  const handleFormatOnBlur = (
    display: string,
    setDisplay: (s: string) => void
  ) => {
    const raw = display.replace(/,/g, "");
    const numValue = Number(raw || 0);
    if (!isNaN(numValue) && numValue > 0) {
      setDisplay(numValue.toLocaleString("en-US"));
    } else {
      setDisplay("");
    }
  };

  const handleCreatePayroll = async () => {
    if (!selectedTeacherId || !month || !baseSalaryValue) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const payrollPayload: PayrollCreate = {
        teacher_user_id: Number(selectedTeacherId),
        month: Number(month),
        total_base_salary: baseSalaryValue,
        reward_bonus: bonusValue,
        sent_at: new Date().toISOString(),
      };

      await createPayroll(payrollPayload);
      onClose();
      await onCreated();
      alert("Tạo bảng lương thành công!");
    } catch (error) {
      console.error("Failed to create payroll:", error);
      setErrorMessage("Có lỗi xảy ra khi tạo bảng lương.");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 flex justify-center items-center z-50 cursor-pointer"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-lg shadow-xl w-96 p-6 text-white relative cursor-default"
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

        <h2 className="text-xl font-bold mb-4 text-center">Tạo bảng lương mới</h2>

        <div className="space-y-4">
          {/* Teacher Select */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Giáo viên</label>
            {loading ? (
              <p className="text-gray-400">Đang tải danh sách giáo viên...</p>
            ) : (
              <select
                aria-label="Chọn giáo viên"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-gray-700 text-white rounded-md p-2 cursor-pointer"
              >
                <option value="" className="text-black">
                  -- Chọn giáo viên --
                </option>
                {teachers.map((teacher: User) => (
                  <option
                    key={teacher.user_id}
                    value={teacher.user_id}
                    className="text-black"
                  >
                    {`ID: ${teacher.user_id} - ${teacher.full_name} (${teacher.email})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Month Input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Tháng</label>
            <Input
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full"
              min="1"
              max="12"
            />
          </div>

          {/* Base Salary Input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Lương cơ bản</label>
            <Input
              type="text"
              value={baseSalaryDisplay}
              onChange={(e) =>
                handleNumberInput(e, setBaseSalaryDisplay, setBaseSalaryValue)
              }
              onBlur={() => handleFormatOnBlur(baseSalaryDisplay, setBaseSalaryDisplay)}
              className="w-full"
            />
          </div>

          {/* Bonus Input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Thưởng</label>
            <Input
              type="text"
              value={bonusDisplay}
              onChange={(e) =>
                handleNumberInput(e, setBonusDisplay, setBonusValue)
              }
              onBlur={() => handleFormatOnBlur(bonusDisplay, setBonusDisplay)}
              className="w-full"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleCreatePayroll}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg cursor-pointer"
          >
            Tạo mới
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
