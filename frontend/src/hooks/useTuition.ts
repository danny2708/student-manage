import { useState, useCallback } from "react";
import { 
  getTuitions, 
  getTuitionsByStudentId, 
  getTuitionsByParentId, 
  Tuition, 
  createTuition, 
  updateTuition, 
  deleteTuition, 
} from "../services/api/tuition";

export function useTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(false); // 🚀 ban đầu không loading
  const [error, setError] = useState<string | null>(null);

  // common fetch wrapper
  const handleFetch = useCallback(async <T,>(apiFn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFn();
      return data;
    } catch (err) {
      console.error("Tuition API error:", err);
      setError("Lỗi tải dữ liệu học phí.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTuitions = useCallback(async () => {
    const data = await handleFetch(() => getTuitions());
    if (data) setTuitions(data);
  }, [handleFetch]);

  const fetchTuitionsByStudentId = useCallback(async (student_user_id: number) => {
    const data = await handleFetch(() => getTuitionsByStudentId(student_user_id));
    if (data) setTuitions(data);
  }, [handleFetch]);

  const fetchTuitionsByParentId = useCallback(async (parent_id: number) => {
    const data = await handleFetch(() => getTuitionsByParentId(parent_id));
    if (data) setTuitions(data);
  }, [handleFetch]);

  const addTuition = useCallback(async (newData: any) => {
    const created = await handleFetch(() => createTuition(newData));
    if (created) setTuitions((prev) => [...prev, created]);
  }, [handleFetch]);

  const editTuition = useCallback(async (id: number, updatedData: any) => {
    const updated = await handleFetch(() => updateTuition(id, updatedData));
    if (updated) setTuitions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, [handleFetch]);

  const removeTuition = useCallback(async (id: number) => {
    const ok = await handleFetch(() => deleteTuition(id));
    if (ok !== null) setTuitions((prev) => prev.filter((t) => t.id !== id));
  }, [handleFetch]);

  return { 
    tuitions, 
    loading, 
    error, 
    addTuition, 
    editTuition, 
    removeTuition, 
    fetchTuitions,
    fetchTuitionsByStudentId,
    fetchTuitionsByParentId,
  };
}
