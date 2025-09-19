"use client"

import { useState, useCallback } from "react"
import {
  getTeacherReviews,
  getTeacherReviewsByTeacherId,
  getTeacherReviewsByStudentId,
  createTeacherReview,
  updateTeacherReview,
  deleteTeacherReview,
  TeacherReviewView,
  TeacherReviewCreate,
  TeacherReviewUpdate,
} from "../../src/services/api/teacherReview"

export function useTeacherReviews() {
  const [reviews, setReviews] = useState<TeacherReviewView[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTeacherReviews()
      setReviews(data)
      return data // Trả về dữ liệu để có thể sử dụng bên ngoài hook
    } catch (err: any) {
      setError(err.message || "Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReviewsByTeacherId = useCallback(async (teacherUserId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTeacherReviewsByTeacherId(teacherUserId)
      setReviews(data)
      return data
    } catch (err: any) {
      setError(err.message || "Failed to load teacher reviews")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReviewsByStudentId = useCallback(async (studentUserId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTeacherReviewsByStudentId(studentUserId)
      setReviews(data)
      return data
    } catch (err: any) {
      setError(err.message || "Failed to load student reviews")
    } finally {
      setLoading(false)
    }
  }, [])
  
  const createReview = useCallback(async (newReview: TeacherReviewCreate) => {
    setLoading(true);
    setError(null);
    try {
      await createTeacherReview(newReview);
      await fetchAllReviews(); // Tải lại toàn bộ danh sách reviews
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create review");
    } finally {
      setLoading(false);
    }
  }, [fetchAllReviews]);

  const updateReview = useCallback(async (reviewId: number, updatedReview: TeacherReviewUpdate) => {
    setLoading(true);
    setError(null);
    try {
      await updateTeacherReview(reviewId, updatedReview);
      await fetchAllReviews(); 
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update review");
    } finally {
      setLoading(false);
    }
  }, [fetchAllReviews]);

  const deleteReview = useCallback(async (reviewId: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTeacherReview(reviewId);
      await fetchAllReviews(); 
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete review");
    } finally {
      setLoading(false);
    }
  }, [fetchAllReviews]);

  
  return {
    reviews,
    loading,
    error,
    fetchAllReviews,
    fetchReviewsByTeacherId,
    fetchReviewsByStudentId,
    createReview,
    updateReview,
    deleteReview
  }
}
