"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
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
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lịch học");
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (data: ScheduleCreate) => {
    try {
      const newItem = await createSchedule(data);
      setSchedules((prev) => [...prev, newItem]);
      return newItem;
    } catch (err: any) {
      throw new Error(err.message || "Không thể tạo lịch học");
    }
  };

  const editSchedule = async (id: number, data: ScheduleUpdate) => {
    try {
      const updated = await updateSchedule(id, data);
      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || "Không thể cập nhật lịch học");
    }
  };

  const removeSchedule = async (id: number) => {
    try {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Không thể xóa lịch học");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

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
