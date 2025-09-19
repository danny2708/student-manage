"use client";

import * as React from "react";
import { Star, Settings, Filter, X } from "lucide-react";
import { useTeacherReviews } from "../../../src/hooks/useTeacherReview";
import { motion, AnimatePresence } from "framer-motion";

interface TeacherReviewManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
}

export default function TeacherReviewManagement({
  searchTerm,
  updateSearchTerm,
}: TeacherReviewManagementProps) {
  const { reviews, loading, error, fetchAllReviews } = useTeacherReviews();

  React.useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  // State cho dropdown filter
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterStudent, setFilterStudent] = React.useState("");
  const [filterRating, setFilterRating] = React.useState("");

  // Lấy danh sách giáo viên và học sinh duy nhất cho dropdown options
  const teacherOptions = React.useMemo(() => {
    return Array.from(new Set(reviews.map((r) => r.teacher_name))).filter(Boolean);
  }, [reviews]);

  const studentOptions = React.useMemo(() => {
    return Array.from(new Set(reviews.map((r) => r.student_name))).filter(Boolean);
  }, [reviews]);

  // Lọc reviews theo toàn bộ tiêu chí
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      (review.review_content ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.teacher_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.student_name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeacher = filterTeacher ? review.teacher_name === filterTeacher : true;
    const matchesStudent = filterStudent ? review.student_name === filterStudent : true;
    const matchesRating = filterRating ? Math.round(review.rating) === Number(filterRating) : true;

    return matchesSearch && matchesTeacher && matchesStudent && matchesRating;
  });

  const resetFilters = () => {
    setFilterTeacher("");
    setFilterStudent("");
    setFilterRating("");
    updateSearchTerm("teacherReview", "");
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRating(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Review Management</h2>
      </div>

      <div className="text-gray-900 flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("teacherReview", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Star className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilterPanel((s) => !s)}
          className="px-4 py-2 bg-gray-500 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4 text-white" />
          <span className="text-white">Filter</span>
        </button>
      </div>

      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Teacher Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">Teacher</label>
                <select
                  aria-label="Filter by teacher"
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All</option>
                  {teacherOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">Student</label>
                <select
                  aria-label="Filter by student"
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All</option>
                  {studentOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">Rating</label>
                <select
                  aria-label="Filter by rating"
                  value={filterRating}
                  onChange={handleRatingChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All</option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {"★".repeat(rating)} ({rating})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-gray-300">Loading reviews...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">TEACHER</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">STUDENT</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">RATING</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">REVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-3 py-3 text-sm text-gray-300">{review.id}</td>
                    <td className="px-3 py-3 text-sm text-gray-300 break-words">{review.teacher_name}</td>
                    <td className="px-3 py-3 text-sm text-gray-300 break-words">{review.student_name}</td>
                    <td className="px-3 py-3 text-sm text-yellow-400">
                      {"★".repeat(Math.round(review.rating))}
                      {"☆".repeat(5 - Math.round(review.rating))}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 break-words">{review.review_content}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No reviews found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}