"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../../../../components/ui/input";
import { useUsers } from "../../../../src/hooks/useUsers";
import { createTuition } from "../../../../src/services/api/tuition";

interface CreateTuitionFormProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export function CreateTuitionForm({
  onClose,
  onCreated,
}: CreateTuitionFormProps) {
  const { users, fetchUsers, loading } = useUsers();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [term, setTerm] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [amountValue, setAmountValue] = useState(0);

  const [dueDate, setDueDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const students = users.filter((user) => user.roles.includes("student"));

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

  const handleFormatOnBlur = (display: string, setDisplay: (s: string) => void) => {
    const raw = display.replace(/,/g, "");
    const numValue = Number(raw || 0);
    if (!isNaN(numValue) && numValue > 0) {
      setDisplay(numValue.toLocaleString("en-US"));
    } else {
      setDisplay("");
    }
  };

  const handleCreateTuition = async () => {
    if (!selectedStudentId || !term || !amountValue || !dueDate) {
      setErrorMessage("Vui lòng điền đầy đủ các trường.");
      return;
    }

    try {
      const tuitionPayload = {
        student_user_id: Number(selectedStudentId),
        amount: amountValue,
        term: Number(term),
        due_date: dueDate,
      };

      await createTuition(tuitionPayload);
      onClose();
      await onCreated();
      alert("Tạo học phí thành công!");
    } catch (error) {
      console.error("Failed to create tuition:", error);
      setErrorMessage("Có lỗi xảy ra khi tạo học phí.");
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

        <h2 className="text-xl font-bold mb-4 text-center">Tạo Học Phí Mới</h2>

        <div className="space-y-4">
          {/* Student Select */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Học sinh</label>
            {loading ? (
              <p className="text-gray-400">Đang tải danh sách học sinh...</p>
            ) : (
              <select
                aria-label="Chọn học sinh"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-gray-700 text-white rounded-md p-2 cursor-pointer"
              >
                <option value="" className="text-white">
                  -- Chọn học sinh --
                </option>
                {students.map((student) => (
                  <option
                    key={student.user_id}
                    value={student.user_id}
                    className="text-white"
                  >
                    {`ID: ${student.user_id} - ${student.full_name} (${student.email})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Term Input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Kỳ học</label>
            <Input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Amount Input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Số tiền</label>
            <Input
              type="text"
              value={amountDisplay}
              onChange={(e) =>
                handleNumberInput(e, setAmountDisplay, setAmountValue)
              }
              onBlur={() => handleFormatOnBlur(amountDisplay, setAmountDisplay)}
              className="w-full"
            />
          </div>

          {/* Due Date Input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Ngày đến hạn</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleCreateTuition}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg cursor-pointer"
          >
            Tạo Mới
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
