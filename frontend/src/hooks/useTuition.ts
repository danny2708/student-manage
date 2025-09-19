import { useEffect, useState } from "react";
import { 
  getTuitions, 
  getTuitionsByStudentId, 
  getTuitionsByParentId, 
  Tuition, 
  createTuition, 
  updateTuition, 
  deleteTuition, 
  updateTuitionStatus 
} from "../services/api/tuition";

export function useTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm fetch data ban đầu
  async function fetchTuitions() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTuitions();
      setTuitions(data);
    } catch (err) {
      setError("Không thể tải danh sách học phí.");
    } finally {
      setLoading(false);
    }
  }

  // Hàm fetch data theo student_user_id
  async function fetchTuitionsByStudentId(student_user_id: number) {
    setLoading(true);
    setError(null);
    try {
      const data = await getTuitionsByStudentId(student_user_id);
      setTuitions(data);
    } catch (err) {
      setError("Không thể tải danh sách học phí cho học sinh này.");
    } finally {
      setLoading(false);
    }
  }
  
  // Hàm fetch data theo parent_id
  async function fetchTuitionsByParentId(parent_id: number) {
    setLoading(true);
    setError(null);
    try {
      const data = await getTuitionsByParentId(parent_id);
      setTuitions(data);
    } catch (err) {
      setError("Không thể tải danh sách học phí cho phụ huynh này.");
    } finally {
      setLoading(false);
    }
  }

  // Hàm thêm học phí với xử lý lỗi
  async function addTuition(newData: any) {
    try {
      setLoading(true);
      const created = await createTuition(newData);
      setTuitions((prev) => [...prev, created]);
      setError(null); // Xóa lỗi nếu thao tác thành công
    } catch (err) {
      setError("Thêm học phí thất bại.");
    } finally {
      setLoading(false);
    }
  }

  // Hàm chỉnh sửa học phí với xử lý lỗi
  async function editTuition(id: number, updatedData: any) {
    try {
      setLoading(true);
      const updated = await updateTuition(id, updatedData);
      setTuitions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setError(null);
    } catch (err) {
      setError("Chỉnh sửa học phí thất bại.");
    } finally {
      setLoading(false);
    }
  }

  // Hàm thay đổi trạng thái với xử lý lỗi
  async function changeStatus(id: number, status: "paid" | "pending" | "overdue") {
    try {
      setLoading(true);
      const updated = await updateTuitionStatus(id, { payment_status: status });
      // Cập nhật lại trạng thái của học phí trong state
      setTuitions((prev) => prev.map((t) => (t.id === id ? { ...t, status: updated.status } : t)));
      setError(null);
    } catch (err) {
      setError("Cập nhật trạng thái thất bại.");
    } finally {
      setLoading(false);
    }
  }

  // Hàm xóa học phí với xử lý lỗi
  async function removeTuition(id: number) {
    try {
      setLoading(true);
      await deleteTuition(id);
      setTuitions((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      setError("Xóa học phí thất bại.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch dữ liệu khi component được mount
  useEffect(() => {
    fetchTuitions();
  }, []);

  // Trả về state và các hàm thao tác
  return { 
    tuitions, 
    loading, 
    error, 
    addTuition, 
    editTuition, 
    removeTuition, 
    changeStatus, 
    fetchTuitions,
    fetchTuitionsByStudentId,
    fetchTuitionsByParentId,
  };
}