"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Teacher,
  TeacherCreate,
  TeacherUpdate,
  ClassTaught,
  getAllTeachers,
  getTeacherByUserId,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getClassesByTeacherId
} from "../services/api/teacher";

export function useTeacher() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setError("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeacherDetails = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const data = await getTeacherByUserId(userId);
      return data;
    } catch (err) {
      console.error(`Failed to fetch teacher with ID ${userId}:`, err);
      setError(`Failed to fetch teacher with ID ${userId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClassesTaught = useCallback(async (teacherUserId: number): Promise<ClassTaught[] | null> => {
    setLoading(true);
    try {
      const classes = await getClassesByTeacherId(teacherUserId);
      return classes;
    } catch (err) {
      console.error(`Failed to fetch classes for teacher ID ${teacherUserId}:`, err);
      setError(`Failed to fetch classes for teacher ID ${teacherUserId}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTeacher = async (payload: TeacherCreate) => {
    setLoading(true);
    try {
      const newTeacher = await createTeacher(payload);
      setTeachers(prev => [...prev, newTeacher]);
    } catch (err) {
      console.error("Failed to create teacher:", err);
      setError("Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  const editTeacher = async (userId: number, payload: TeacherUpdate) => {
    setLoading(true);
    try {
      const updated = await updateTeacher(userId, payload);
      setTeachers(prev => prev.map(t => (t.user_id === userId ? updated : t)));
    } catch (err) {
      console.error("Failed to update teacher:", err);
      setError("Failed to update teacher");
    } finally {
      setLoading(false);
    }
  };

  const removeTeacher = async (userId: number) => {
    setLoading(true);
    try {
      await deleteTeacher(userId);
      setTeachers(prev => prev.filter(t => t.user_id !== userId));
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      setError("Failed to delete teacher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    loading,
    error,
    fetchTeachers,
    getTeacherDetails,
    fetchClassesTaught,
    addTeacher,
    editTeacher,
    removeTeacher
  };
}
