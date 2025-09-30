import { useState, useCallback } from "react";
import {
  getEvaluations,
  createEvaluation,
  deleteEvaluation,
  getEvaluationRecord,
  getEvaluationsOfStudent,
  getEvaluationsOfTeacher,
  getSummaryAndCounts,
  EvaluationView,
  EvaluationRecord,
  EvaluationCreate,
  EvaluationSummary,
} from "../services/api/evaluation";

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<EvaluationView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluations();
      setEvaluations(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch evaluations");
      console.error("Failed to fetch evaluations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvaluation = useCallback(async (payload: EvaluationCreate): Promise<EvaluationRecord | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const newEvaluation = await createEvaluation(payload);
      setEvaluations(prev => [...prev, newEvaluation as any]);
      return newEvaluation;
    } catch (err: any) {
      setError(err.message || "Failed to add evaluation");
      console.error("Failed to add evaluation:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeEvaluation = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteEvaluation(id);
      setEvaluations(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete evaluation");
      console.error("Failed to delete evaluation:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvaluationRecord = useCallback(async (id: number): Promise<EvaluationRecord | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluationRecord(id);
      return data;
    } catch (err: any) {
      setError(err.message || `Failed to fetch evaluation record with ID ${id}`);
      console.error(`Failed to fetch evaluation record with ID ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvaluationsOfStudent = useCallback(async (studentUserId: number): Promise<EvaluationView[] | undefined> => {
    setLoading(true);
    setError(null);
    try {
      return await getEvaluationsOfStudent(studentUserId);
    } catch (err: any) {
      setError(err.message || `Failed to fetch evaluations for student ${studentUserId}`);
      console.error(`Failed to fetch evaluations for student ${studentUserId}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvaluationsOfTeacher = useCallback(async (teacherUserId: number): Promise<EvaluationView[] | undefined> => {
    setLoading(true);
    setError(null);
    try {
      return await getEvaluationsOfTeacher(teacherUserId);
    } catch (err: any) {
      setError(err.message || `Failed to fetch evaluations for teacher ${teacherUserId}`);
      console.error(`Failed to fetch evaluations for teacher ${teacherUserId}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummaryAndCounts = useCallback(async (studentUserId: number): Promise<EvaluationSummary | undefined> => {
    setLoading(true);
    setError(null);
    try {
      return await getSummaryAndCounts(studentUserId);
    } catch (err: any) {
      setError(err.message || `Failed to fetch summary for student ${studentUserId}`);
      console.error(`Failed to fetch summary for student ${studentUserId}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    evaluations,
    loading,
    error,
    fetchAllEvaluations,
    addEvaluation,
    removeEvaluation,
    fetchEvaluationRecord,
    fetchEvaluationsOfStudent,
    fetchEvaluationsOfTeacher,
    fetchSummaryAndCounts,
  };
}