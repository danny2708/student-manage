// components/functions/TuitionInfoForm.tsx
"use client";

import { Input } from "../../../components/ui/input";
import { Tuition } from "../../../src/services/api/tuition";

interface TuitionInfoFormProps {
  data: Tuition;
  onInputChange: (field: string, value: string | number) => void;
  disabled?: boolean;
}

export function TuitionInfoForm({ data, onInputChange, disabled }: TuitionInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Student</span>
        <span className="text-white ml-6">{data.student}</span>
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Term</span>
        <Input
          type="text"
          value={data.term}
          onChange={(e) => onInputChange("term", Number(e.target.value))}
          disabled={disabled}
          className="w-48 ml-6"
        />
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Amount</span>
        <Input
          type="text"
          value={data.amount}
          onChange={(e) => onInputChange("amount", Number(e.target.value))}
          disabled={disabled}
          className="w-48 ml-6"
        />
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Status</span>
        <select
          value={data.status}
          onChange={(e) => onInputChange("status", e.target.value)}
          className="w-48 ml-6"
          aria-label="Select status"
        >
          <option value="pending" className="text-black">Pending</option>
          <option value="paid" className="text-black">Paid</option>
          <option value="overdue" className="text-black">Overdue</option>
        </select>
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Due date</span>
        <Input
          type="date"
          value={
            data.due_date
              ? (() => {
                  const [d, m, y] = data.due_date.split("/");
                  return `${y}-${m}-${d}`;
                })()
              : ""
          }
          onChange={(e) => {
            const [y, m, d] = e.target.value.split("-");
            onInputChange("due_date", `${d}/${m}/${y}`);
          }}
          disabled={disabled}
          className="w-48 ml-6"
        />
      </div>
    </div>
  );
}