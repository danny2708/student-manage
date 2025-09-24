"use client";

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from "react";
import toast from "react-hot-toast"; 
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
      // show toast and keep error state
      toast.error(err?.message || "Không thể tải danh sách lịch học");
      setError(err?.message || "Không thể tải danh sách lịch học");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSchedules = useCallback(() => {
    setSchedules([]);
    setLoading(true);
    setError(null);
  }, []);

  const addSchedule = useCallback(
    async (data: ScheduleCreate) => {
      try {
        // create on server
        const newItem = await createSchedule(data);

        // optimistic add to UI so user sees something immediately (optional)
        setSchedules((prev) => [...prev, newItem]);

        // fetch fresh list to ensure fields like id, class_name are fully populated
        // (some APIs return partial object on create)
        try {
          await fetchSchedules();
        } catch (fetchErr: any) {
          // If fetch fails, still keep created item in state but notify user
          toast.error("Tạo lịch thành công nhưng cập nhật danh sách thất bại.");
          console.error("fetchSchedules after create failed:", fetchErr);
        }

        toast.success("Tạo lịch học thành công!");
        return newItem;
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || err?.message || "Không thể tạo lịch học");
        throw new Error(err?.response?.data?.detail || err?.message || "Không thể tạo lịch học");
      }
    },
    [fetchSchedules]
  );

  const editSchedule = useCallback(
    async (id: number, data: ScheduleUpdate) => {
      try {
        const updated = await updateSchedule(id, data);

        // merge updated item into state
        setSchedules((prev) =>
          prev.map((s) => {
            if (s.id === id) {
              return { ...s, ...updated };
            }
            return s;
          })
        );

        // Optionally refresh to ensure server canonical data
        try {
          await fetchSchedules();
        } catch (fetchErr: any) {
          console.warn("fetchSchedules after update failed:", fetchErr);
        }

        toast.success("Cập nhật lịch học thành công!");
        return updated;
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || err?.message || "Không thể cập nhật lịch học");
        throw new Error(err?.response?.data?.detail || err?.message || "Không thể cập nhật lịch học");
      }
    },
    [fetchSchedules]
  );

  const removeSchedule = useCallback(
    async (id: number) => {
      try {
        await deleteSchedule(id);
        setSchedules((prev) => prev.filter((s) => s.id !== id));
        toast.success("Xoá lịch học thành công!");
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || err?.message || "Không thể xóa lịch học");
        throw new Error(err?.response?.data?.detail || err?.message || "Không thể xóa lịch học");
      }
    },
    []
  );

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
