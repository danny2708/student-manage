"use client";

import { Input } from "../../../components/ui/input";
import { Class } from "../../../src/services/api/class";

interface ClassInfoFormProps {
  data: Class;
  onInputChange: (field: string, value: string | number) => void;
  disabled?: boolean;
}

export function ClassInfoForm({ data, onInputChange, disabled }: ClassInfoFormProps) {
  const inputClasses = `w-48 ml-6 ${disabled ? 'cursor-not-allowed bg-gray-600 text-gray-400' : ''}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Class Name</span>
        <Input
          type="text"
          value={data.class_name}
          onChange={(e) => onInputChange("class_name", e.target.value)}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Teacher</span>
        <span className="text-white ml-6">{data.teacher_name}</span>
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Capacity</span>
        <Input
          type="number"
          value={data.capacity}
          onChange={(e) => onInputChange("capacity", Number(e.target.value))}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Fee</span>
        <Input
          type="number"
          value={data.fee}
          onChange={(e) => onInputChange("fee", Number(e.target.value))}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
    </div>
  );
}