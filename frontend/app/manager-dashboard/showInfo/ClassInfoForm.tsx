// components/functions/ClassInfoForm.tsx
"use client";

import { Input } from "../../../components/ui/input";
import { Class } from "../../../src/services/api/class";

interface ClassInfoFormProps {
  data: Class;
  onInputChange: (field: string, value: string | number) => void;
}

export function ClassInfoForm({ data, onInputChange }: ClassInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Class Name</span>
        <Input
          type="text"
          value={data.class_name}
          onChange={(e) => onInputChange("class_name", e.target.value)}
          className="w-48 ml-6"
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
          className="w-48 ml-6"
        />
      </div>
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-32 shrink-0">Fee</span>
        <Input
          type="number"
          value={data.fee}
          onChange={(e) => onInputChange("fee", Number(e.target.value))}
          className="w-48 ml-6"
        />
      </div>
    </div>
  );
}