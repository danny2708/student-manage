// services/api/evaluation.ts
import api from "./api";

// Enum tương ứng với backend, phản ánh loại đánh giá
export type EvaluationType = "study" | "discipline" | "review";

// Interface đại diện cho dữ liệu Evaluation từ backend (Evaluation.py)
export interface EvaluationRecord {
  evaluation_id: number;
  teacher_user_id: number;
  student_user_id: number;
  study_point: number;
  discipline_point: number;
  evaluation_type: EvaluationType;
  evaluation_content?: string;
  evaluation_date: string; 
}

// Payload để tạo một bản ghi đánh giá mới
export interface EvaluationCreate {
  student_user_id: number;
  study_point: number;
  discipline_point: number;
  evaluation_type: EvaluationType;
  evaluation_content?: string;
  evaluation_date?: string;
}

// Dữ liệu tóm tắt điểm
export interface EvaluationSummary {
  student_user_id: number;
  final_study_point: number;
  final_discipline_point: number;
  study_plus_count: number;
  study_minus_count: number;
  discipline_plus_count: number;
  discipline_minus_count: number;
}

// Dữ liệu đánh giá dạng view, có tên thay vì id
export interface EvaluationView {
  id: number;
  teacher: string;
  student: string;
  type: EvaluationType;
  date: string;
  content: string;
}

// --- Endpoints ---

// Lấy danh sách tất cả các đánh giá (cho manager và teacher)
export async function getEvaluations(): Promise<EvaluationView[]> {
  const res = await api.get<EvaluationView[]>("/evaluations");
  return res.data;
}

// Tạo bản ghi đánh giá mới
export async function createEvaluation(payload: EvaluationCreate): Promise<EvaluationRecord> {
  const res = await api.post<EvaluationRecord>("/evaluations/", payload);
  return res.data;
}

// Lấy điểm tổng của một học sinh
export async function getTotalScoreByStudent(studentUserId: number): Promise<EvaluationSummary> {
  const res = await api.get<EvaluationSummary>(`/evaluations/total_score/${studentUserId}`);
  return res.data;
}

// Lấy điểm tổng và số lần cộng/trừ điểm của một học sinh
export async function getSummaryAndCounts(studentUserId: number): Promise<EvaluationSummary> {
  const res = await api.get<EvaluationSummary>(`/evaluations/summary_and_counts/${studentUserId}`);
  return res.data;
}

// Lấy một bản ghi đánh giá cụ thể bằng ID
export async function getEvaluationRecord(evaluationId: number): Promise<EvaluationRecord> {
  const res = await api.get<EvaluationRecord>(`/evaluations/${evaluationId}`);
  return res.data;
}

// Lấy danh sách đánh giá của một học sinh
export async function getEvaluationsOfStudent(studentUserId: number): Promise<EvaluationView[]> {
  const res = await api.get<EvaluationView[]>(`/evaluations/student/${studentUserId}`);
  return res.data;
}

// Lấy danh sách đánh giá của một giáo viên
export async function getEvaluationsOfTeacher(teacherUserId: number): Promise<EvaluationView[]> {
  const res = await api.get<EvaluationView[]>(`/evaluations/teacher/${teacherUserId}`);
  return res.data;
}

// Xóa một bản ghi đánh giá
export async function deleteEvaluation(evaluationId: number): Promise<void> {
  await api.delete(`/evaluations/${evaluationId}`);
}