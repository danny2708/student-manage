// ClassContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import {
  Class,
  ClassCreate,
  ClassUpdate,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getTeacherClasses as getTeacherClassesApi,
  exportClass,
} from "../services/api/class";

interface ClassContextType {
  classes: Class[];
  loading: boolean;
  error: string | null;
  fetchClasses: () => Promise<void>;
  addClass: (data: ClassCreate) => Promise<Class>;
  editClass: (id: number, data: ClassUpdate) => Promise<Class>;
  removeClass: (id: number) => Promise<void>;
  getTeacherClasses: (teacherUserId: number) => Promise<Class[]>;
  exportClassData: (id: number) => Promise<void>;
}

const ClassContext = createContext<ClassContextType | null>(null);

export const ClassesProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    console.log("[ClassesProvider] fetchClasses called", new Date().toISOString());
    setLoading(true);
    setError(null);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, []);

  const addClass = useCallback(async (data: ClassCreate) => {
    try {
      const newClass = await createClass(data);
      setClasses((prev) => [...prev, newClass]);
      return newClass;
    } catch (err: any) {
      throw new Error(err.message || "Không thể tạo lớp học");
    }
  }, []);

  const editClass = useCallback(async (id: number, data: ClassUpdate) => {
    try {
      const updated = await updateClass(id, data);
      setClasses((prev) => prev.map((c) => (c.class_id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || "Không thể cập nhật lớp học");
    }
  }, []);

  const removeClass = useCallback(async (id: number) => {
    try {
      await deleteClass(id);
      setClasses((prev) => prev.filter((c) => c.class_id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Không thể xóa lớp học");
    }
  }, []);

  const getTeacherClasses = useCallback(async (teacherUserId: number) => {
    console.log("[ClassesProvider] getTeacherClasses called for teacher:", teacherUserId, new Date().toISOString());
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherClassesApi(teacherUserId);
      setLoading(false);
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Không thể tải danh sách lớp học của giáo viên.");
      throw new Error(err.message || "Không thể tải danh sách lớp học của giáo viên.");
    }
  }, []);

  const exportClassData = useCallback(async (id: number) => {
    try {
      await exportClass(id);
    } catch (err: any) {
      throw new Error(err.message || "Không thể xuất danh sách lớp");
    }
  }, []);

  // gọi 1 lần khi provider mount
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const value = useMemo(
    () => ({
      classes,
      loading,
      error,
      fetchClasses,
      addClass,
      editClass,
      removeClass,
      getTeacherClasses,
      exportClassData,
    }),
    [classes, loading, error, fetchClasses, addClass, editClass, removeClass, getTeacherClasses, exportClassData]
  );

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
};

export const useClasses = (): ClassContextType => {
  const context = useContext(ClassContext);
  if (!context) throw new Error("useClasses must be used within <ClassesProvider>");
  return context;
};
