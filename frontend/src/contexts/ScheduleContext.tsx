// src/contexts/ScheduleContext.tsx
"use client";

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from "react";
import toast from "react-hot-toast"; // 🆕 Import toast
import {
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/api/schedule";

interface ScheduleContextType {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: () => Promise<void>;
  addSchedule: (data: ScheduleCreate) => Promise<Schedule>;
  editSchedule: (id: number, data: ScheduleUpdate) => Promise<Schedule>;
  removeSchedule: (id: number) => Promise<void>;
  resetSchedules: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (err: any) {
      // 🆕 Dùng toast thay vì setError, nhưng vẫn giữ setError cho state
      toast.error(err.message || "Không thể tải danh sách lịch học");
      setError(err.message || "Không thể tải danh sách lịch học");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSchedules = useCallback(() => {
    setSchedules([]);
    setLoading(true);
    setError(null);
  }, []);

  const addSchedule = useCallback(async (data: ScheduleCreate) => {
    try {
      const newItem = await createSchedule(data);
      setSchedules((prev) => [...prev, newItem]);
      toast.success("Tạo lịch học thành công!"); // 🆕 Thêm toast thành công
      return newItem;
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo lịch học"); // 🆕 Dùng toast báo lỗi
      throw new Error(err.message || "Không thể tạo lịch học");
    }
  }, []);

  const editSchedule = useCallback(async (id: number, data: ScheduleUpdate) => {
    try {
      const updated = await updateSchedule(id, data);

      setSchedules((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            return { ...s, ...updated };
          }
          return s;
        })
      );
      toast.success("Cập nhật lịch học thành công!");
      return updated;
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật lịch học");
      throw new Error(err.message || "Không thể cập nhật lịch học");
    }
  }, []);

  const removeSchedule = useCallback(async (id: number) => {
    try {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success("Xoá lịch học thành công!"); // 🆕 Thêm toast thành công
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa lịch học"); // 🆕 Dùng toast báo lỗi
      throw new Error(err.message || "Không thể xóa lịch học");
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        error,
        fetchSchedules,
        addSchedule,
        editSchedule,
        removeSchedule,
        resetSchedules,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedules() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedules phải dùng bên trong ScheduleProvider");
  return ctx;
}