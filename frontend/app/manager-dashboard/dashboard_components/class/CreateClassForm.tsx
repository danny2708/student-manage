"use client";

import React, { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { useUsers, User } from "../../../../src/contexts/UsersContext";
import { useClasses } from "../../../../src/contexts/ClassContext";
import { useSubjects } from "../../../../src/contexts/SubjectContext";
import { ClassCreate } from "../../../../src/services/api/class";

interface CreateClassFormProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export function CreateClassForm({ onClose, onCreated }: CreateClassFormProps) {
  const { users, loading: usersLoading } = useUsers();
  const { addClass } = useClasses();
  const { subjects, loading: subjectsLoading } = useSubjects();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [subjectName, setSubjectName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [className, setClassName] = useState("");
  const [capacityDisplay, setCapacityDisplay] = useState("");
  const [capacityValue, setCapacityValue] = useState(0);
  const [feeDisplay, setFeeDisplay] = useState("");
  const [feeValue, setFeeValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // lọc giáo viên từ context users
  const teachers: User[] = users.filter((user) =>
    user.roles?.includes("teacher")
  );

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

  const handleCreate = async () => {
    if (
      !selectedTeacherId ||
      !selectedSubjectId ||
      !className ||
      !capacityValue ||
      !feeValue
    ) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const payload: ClassCreate = {
        class_name: className,
        teacher_user_id: Number(selectedTeacherId),
        subject_id: selectedSubjectId,
        capacity: capacityValue,
        fee: feeValue,
      };

      await addClass(payload);
      onClose();
      await onCreated();
      alert("Tạo lớp học thành công!");
    } catch (error) {
      console.error("Failed to create class:", error);
      setErrorMessage("Có lỗi xảy ra khi tạo lớp học.");
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

        <h2 className="text-xl font-bold mb-4 text-center">Tạo lớp học mới</h2>

        <div className="space-y-4">
          {/* Class name */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Tên lớp</label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Teacher select */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Giáo viên</label>
            {usersLoading ? (
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
                {teachers.map((teacher) => (
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

          {/* Subject select */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Môn học</label>
            {subjectsLoading ? (
              <p className="text-gray-400">Đang tải danh sách môn học...</p>
            ) : (
              <select
                aria-label="Chọn môn học"
                value={selectedSubjectId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedSubjectId(id);
                  const found = subjects.find((s) => s.subject_id === id);
                  setSubjectName(found?.name || "");
                }}
                className="bg-gray-700 text-white rounded-md p-2 cursor-pointer"
              >
                <option value="" className="text-black">
                  -- Chọn môn học --
                </option>
                {subjects.map((s) => (
                  <option
                    key={s.subject_id}
                    value={s.subject_id}
                    className="text-black"
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Capacity input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">
              Số lượng học viên
            </label>
            <Input
              type="text"
              value={capacityDisplay}
              onChange={(e) =>
                handleNumberInput(e, setCapacityDisplay, setCapacityValue)
              }
              onBlur={() =>
                handleFormatOnBlur(capacityDisplay, setCapacityDisplay)
              }
              className="w-full"
            />
          </div>

          {/* Fee input */}
          <div className="flex flex-col">
            <label className="text-cyan-400 font-medium mb-1">Học phí</label>
            <Input
              type="text"
              value={feeDisplay}
              onChange={(e) => handleNumberInput(e, setFeeDisplay, setFeeValue)}
              onBlur={() => handleFormatOnBlur(feeDisplay, setFeeDisplay)}
              className="w-full"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg cursor-pointer"
          >
            Tạo mới
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
