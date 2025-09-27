"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Payroll } from "../../../src/services/api/payroll";

interface PayrollInfoFormProps {
  data: Payroll;
  onInputChange: (field: string, value: string | number) => void;
  disabled?: boolean;
}

// Hàm format chung cho tất cả các trường tiền tệ
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || num === 0) return "";
  return num.toLocaleString("en-US");
};

export function PayrollInfoForm({ data, onInputChange, disabled }: PayrollInfoFormProps) {
  const currentMonthValue = data.month ?? new Date(data.sent_at).getMonth() + 1;
  const calculatedTotal = (data.base_salary || 0) + (data.bonus || 0);

  // --- STATE DÙNG ĐỂ HIỂN THỊ SỐ TIỀN CÓ DẤU PHẨY ---
  const [baseSalaryDisplay, setBaseSalaryDisplay] = useState<string>(
    formatNumber(data.base_salary)
  );
  const [bonusDisplay, setBonusDisplay] = useState<string>(
    formatNumber(data.bonus)
  );

  // --- HÀM XỬ LÝ CHUNG CHO CẢ BASE SALARY VÀ BONUS ---
  const handleNumberChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "base_salary" | "bonus",
    setDisplay: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const rawValue = e.target.value.replace(/,/g, ""); // Loại bỏ dấu phẩy
    
    // Chỉ cập nhật nếu là số hợp lệ hoặc chuỗi rỗng
    if (/^\d*$/.test(rawValue) || rawValue === "") {
      setDisplay(rawValue);
      // Gọi onInputChange để cập nhật giá trị số (Number)
      onInputChange(field, Number(rawValue || 0));
    }
  };

  const handleNumberBlur = (
    displayValue: string,
    setDisplay: React.Dispatch<React.SetStateAction<string>>,
    field: "base_salary" | "bonus"
  ) => {
    const rawValue = displayValue.replace(/,/g, "");
    const numValue = Number(rawValue);

    if (!isNaN(numValue) && numValue > 0) {
      // Định dạng số có dấu phẩy
      setDisplay(numValue.toLocaleString("en-US"));
    } else {
      // Nếu không phải số hợp lệ hoặc 0, reset về rỗng
      setDisplay("");
      // Đảm bảo giá trị lưu trữ vẫn là 0
      onInputChange(field, 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">ID</span>
        <span className="text-white w-48 text-center">{data.id}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Teacher</span>
        <span className="text-white w-48 text-center">{data.teacher}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Month</span>
        <select
          value={currentMonthValue}
          onChange={(e) => onInputChange("month", Number(e.target.value))}
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
      {/* ------------------- BASE SALARY FIELD (Đã Sửa) ------------------- */}
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Base Salary</span>
        <Input
          type="text" // Đổi sang type="text"
          value={baseSalaryDisplay} // Dùng state hiển thị
          onChange={(e) => handleNumberChange(e, "base_salary", setBaseSalaryDisplay)} // Xử lý nhập
          onBlur={() => handleNumberBlur(baseSalaryDisplay, setBaseSalaryDisplay, "base_salary")} // Xử lý blur
          disabled={disabled}
          className="w-48 text-center"
        />
      </div>
      {/* ------------------- BONUS FIELD (Đã Sửa) ------------------- */}
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Bonus</span>
        <Input
          type="text" // Đổi sang type="text"
          value={bonusDisplay} // Dùng state hiển thị
          onChange={(e) => handleNumberChange(e, "bonus", setBonusDisplay)} // Xử lý nhập
          onBlur={() => handleNumberBlur(bonusDisplay, setBonusDisplay, "bonus")} // Xử lý blur
          disabled={disabled}
          className="w-48 text-center"
        />
      </div>
      {/* ------------------- TOTAL FIELD (Đã Format) ------------------- */}
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Total</span>
        <Input
          type="text"
          value={formatNumber(calculatedTotal)} // Format giá trị Total
          readOnly
          className="w-48 text-center"
        />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Status</span>
        <select
          value={data.status}
          onChange={(e) => onInputChange("status", e.target.value)}
          className="w-48 text-white text-center bg-transparent border border-gray-600 rounded-md py-1"
          aria-label="Select status"
        >
          <option value="pending" className="text-black">Pending</option>
          <option value="paid" className="text-black">Paid</option>
        </select>
      </div>
    </div>
  );
}