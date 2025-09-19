"use client";

import React, { createContext, useContext, useCallback } from "react";
import {
  getEnrollmentsByStudentId as apiGetEnrollmentsByStudentId,
  getTotalScoreByStudent as apiGetTotalScoreByStudent,
  getReviewsByStudentId as apiGetReviewsByStudentId,
  Enrollment,
  EvaluationSummary,
  TeacherReview,
} from "../services/api/student";

import {
  EvaluationView,
  getEvaluationsOfStudent as apiGetEvaluationsOfStudent,
} from "../services/api/evaluation";

interface StudentContextType {
  getEnrollmentsByStudentId: (studentUserId: number) => Promise<Enrollment[] | undefined>;
  fetchTotalScoreByStudent: (studentUserId: number) => Promise<EvaluationSummary | undefined>;
  getReviewsByStudentId: (studentUserId: number) => Promise<TeacherReview[] | undefined>;
  getEvaluationsByStudentId: (studentUserId: number) => Promise<EvaluationView[] | undefined>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  }, []);

  const getEnrollmentsByStudentId = useCallback(async (studentUserId: number) => {
    try {
      const data = await apiGetEnrollmentsByStudentId(studentUserId);
      return data?.map(e => ({
        ...e,
        enrollment_date: e.enrollment_date ? formatDate(e.enrollment_date) : e.enrollment_date
      }));
    } catch (err) {
      console.error(err);
    }
  }, [formatDate]);

  const fetchTotalScoreByStudent = useCallback(async (studentUserId: number) => {
    try {
      return await apiGetTotalScoreByStudent(studentUserId);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getReviewsByStudentId = useCallback(async (studentUserId: number) => {
    try {
      const data = await apiGetReviewsByStudentId(studentUserId);
      return data?.map(r => ({
        ...r,
        review_date: r.review_date ? formatDate(r.review_date) : r.review_date
      }));
    } catch (err) {
      console.error(err);
    }
  }, [formatDate]);

  const getEvaluationsByStudentId = useCallback(async (studentUserId: number) => {
    try {
      const data = await apiGetEvaluationsOfStudent(studentUserId);
      return data?.map(ev => ({
        ...ev,
        date: ev.date ? formatDate(ev.date) : ev.date
      }));
    } catch (err) {
      console.error(err);
    }
  }, [formatDate]);

  return (
    <StudentContext.Provider
      value={{
        getEnrollmentsByStudentId,
        fetchTotalScoreByStudent,
        getReviewsByStudentId,
        getEvaluationsByStudentId
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) throw new Error("useStudents must be used within a StudentProvider");
  return context;
};