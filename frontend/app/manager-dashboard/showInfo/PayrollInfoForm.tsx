// components/functions/PayrollInfoForm.tsx
"use client";

import { Input } from "../../../components/ui/input";
import { Payroll } from "../../../src/services/api/payroll";

interface PayrollInfoFormProps {
  data: Payroll;
  onInputChange: (field: string, value: string | number) => void;
}

export function PayrollInfoForm({ data, onInputChange }: PayrollInfoFormProps) {
  const currentMonthValue = data.month ?? new Date(data.sent_at).getMonth() + 1;
  const calculatedTotal = (data.base_salary || 0) + (data.bonus || 0);

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
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Base Salary</span>
        <Input
          type="text"
          value={data.base_salary}
          onChange={(e) => onInputChange("base_salary", Number(e.target.value))}
          className="w-48 text-center"
        />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Bonus</span>
        <Input
          type="text"
          value={data.bonus}
          onChange={(e) => onInputChange("bonus", Number(e.target.value))}
          className="w-48 text-center"
        />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Total</span>
        <Input
          type="text"
          value={calculatedTotal}
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