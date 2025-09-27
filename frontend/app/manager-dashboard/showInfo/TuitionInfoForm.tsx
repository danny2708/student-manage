"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Tuition } from "../../../src/services/api/tuition";

interface TuitionInfoFormProps {
  data: Tuition;
  onInputChange: (field: string, value: string | number) => void;
  disabled?: boolean;
}

export function TuitionInfoForm({
  data,
  onInputChange,
  disabled,
}: TuitionInfoFormProps) {
  // convert "dd/mm/yyyy" → "yyyy-mm-dd" để gán vào input type="date"
  const toISODate = (dmy: string) => {
    if (!dmy.includes("/")) return dmy;
    const [d, m, y] = dmy.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  };

  // giữ luôn ISO để gửi API
  const fromISODate = (iso: string) => iso;

  // SỬA LỖI: Khởi tạo giá trị đã định dạng ngay trong useState.
  // Loại bỏ initialAmount riêng biệt và không cần useEffect để lắng nghe data.amount.
  const [amountDisplay, setAmountDisplay] = useState<string>(
    data.amount?.toLocaleString("en-US") || ""
  );

  // KHÔNG CẦN DÙNG useEffect VÌ NÓ GÂY RA LỖI NHẢY SỐ
  // Dữ liệu sẽ được đồng bộ qua onInputChange và onBlur

  // 1. Xử lý nhập liệu: Chỉ cho phép số và không có dấu phẩy
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, ""); // Loại bỏ dấu phẩy

    // Chỉ cập nhật nếu là số hợp lệ hoặc chuỗi rỗng
    if (/^\d*$/.test(rawValue) || rawValue === "") {
      setAmountDisplay(rawValue);
      // Gọi onInputChange ngay lập tức để cập nhật giá trị số (Number)
      onInputChange("amount", Number(rawValue || 0));
    }
  };

  // 2. Xử lý khi focus ra (blur): Thêm dấu phẩy vào giá trị hiển thị
  const handleAmountBlur = () => {
    const rawValue = amountDisplay.replace(/,/g, "");
    const numValue = Number(rawValue);

    if (!isNaN(numValue) && numValue > 0) {
      // Định dạng số có dấu phẩy
      setAmountDisplay(numValue.toLocaleString("en-US"));
    } else {
      // Nếu không phải số hợp lệ hoặc 0, reset về rỗng
      setAmountDisplay("");
      // Đảm bảo giá trị lưu trữ vẫn là 0 nếu người dùng xóa hết
      onInputChange("amount", 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Student</span>
        <span className="text-white ml-6">{data.student}</span>
      </div>

      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Term</span>
        <Input
          type="number"
          value={data.term}
          onChange={(e) => onInputChange("term", Number(e.target.value))}
          disabled={disabled}
          className="w-48 ml-6"
        />
      </div>

      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Amount</span>
        <Input
          type="text" // Dùng type="text" để quản lý định dạng số
          value={amountDisplay} // Sử dụng state hiển thị (có/không có dấu phẩy)
          onChange={handleAmountChange} // Xử lý khi người dùng nhập
          onBlur={handleAmountBlur} // Xử lý khi focus ra
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
          disabled={disabled}
        >
          <option value="pending" className="text-black">
            Pending
          </option>
          <option value="paid" className="text-black">
            Paid
          </option>
          <option value="overdue" className="text-black">
            Overdue
          </option>
        </select>
      </div>

      <div className="flex items-center">
        <span className="text-cyan-400 font-medium w-24 shrink-0">Due date</span>
        <Input
          type="date"
          value={data.due_date ? toISODate(data.due_date) : ""}
          onChange={(e) => onInputChange("due_date", fromISODate(e.target.value))}
          disabled={disabled}
          className="w-48 ml-6"
        />
      </div>
    </div>
  );
}