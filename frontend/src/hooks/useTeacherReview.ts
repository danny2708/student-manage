"use client"

import { useEffect, useState, useCallback } from "react"
import api from "../../src/services/api/api"
import {
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
      const res = await api.get<TeacherReviewView[]>("/teacher_reviews/")
      setReviews(res.data)
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
      const res = await api.get<TeacherReviewView[]>(`/teacher_reviews/by_teacher/${teacherUserId}`)
      setReviews(res.data)
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
      const res = await api.get<TeacherReviewView[]>(`/teacher_reviews/by_student/${studentUserId}`)
      setReviews(res.data)
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
      await api.post('/teacher_reviews/', newReview);
      await fetchAllReviews(); // Tải lại toàn bộ danh sách reviews
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create review");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReview = useCallback(async (reviewId: number, updatedReview: TeacherReviewUpdate) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/teacher_reviews/${reviewId}`, updatedReview);
      await fetchAllReviews(); 
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update review");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/teacher_reviews/${reviewId}`);
      await fetchAllReviews(); 
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete review");
    } finally {
      setLoading(false);
    }
  }, []);

  
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