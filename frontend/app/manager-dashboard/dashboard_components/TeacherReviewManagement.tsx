"use client";

import * as React from "react";
import { Star, Filter, Calendar as CalendarIcon } from "lucide-react";
import { useTeacherReviews } from "../../../src/hooks/useTeacherReview";
import { useAuth } from "../../../src/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../../components/ui/input";

interface TeacherReviewManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
}

// format date ra dd/mm/yyyy
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN"); // dd/mm/yyyy
};

// chuẩn hóa về YYYY-MM-DD để so sánh filter
const normalizeDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export default function TeacherReviewManagement({
  searchTerm,
  updateSearchTerm,
}: TeacherReviewManagementProps) {
  const { reviews, loading, error, fetchAllReviews } = useTeacherReviews();
  const { user } = useAuth?.() ?? { user: null };

  React.useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  // === LOCAL search state to ensure immediate typing feedback ===
  const [localSearch, setLocalSearch] = React.useState<string>(searchTerm ?? "");
  React.useEffect(() => {
    setLocalSearch(searchTerm ?? "");
  }, [searchTerm]);

  // normalize roles
  const getRoleNames = React.useCallback((roles: any): string[] => {
    if (!roles) return [];
    if (Array.isArray(roles)) {
      return roles
        .map((r) => (typeof r === "string" ? r : r?.name ?? r?.role ?? ""))
        .filter(Boolean)
        .map(String);
    }
    if (typeof roles === "string") return [roles];
    if (typeof roles === "object" && roles !== null) {
      const derived = roles.name ?? roles.role ?? "";
      return derived ? [String(derived)] : [];
    }
    return [];
  }, []);

  const roleNames = React.useMemo(() => getRoleNames(user?.roles), [user?.roles, getRoleNames]);
  const isTeacherRole = roleNames.includes("teacher");
  const isStudentRole = roleNames.includes("student");

  // ---- filter states ----
  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterStudent, setFilterStudent] = React.useState("");
  const [filterRating, setFilterRating] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");

  // ---- popover open ----
  const [openPopover, setOpenPopover] = React.useState<null | "teacher" | "student" | "rating" | "date">(null);

  // ---- options ----
  const teacherOptions = React.useMemo(
    () => Array.from(new Set(reviews.map((r) => r.teacher_name).filter(Boolean))),
    [reviews]
  );
  const studentOptions = React.useMemo(
    () => Array.from(new Set(reviews.map((r) => r.student_name).filter(Boolean))),
    [reviews]
  );

  // click outside để close popover — ref attached to thead only
  const containerRef = React.useRef<HTMLTableSectionElement | null>(null);
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ---- filter logic ----
  const filteredReviews = React.useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        !localSearch ||
        (review.review_content ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
        (review.teacher_name ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
        (review.student_name ?? "").toLowerCase().includes(localSearch.toLowerCase());

      const matchesTeacher = filterTeacher ? review.teacher_name === filterTeacher : true;
      const matchesStudent = filterStudent ? review.student_name === filterStudent : true;
      const matchesRating = filterRating ? Math.round(review.rating) === Number(filterRating) : true;
      const matchesDate = filterDate ? normalizeDate(review.review_date) === filterDate : true;

      return matchesSearch && matchesTeacher && matchesStudent && matchesRating && matchesDate;
    });
  }, [reviews, localSearch, filterTeacher, filterStudent, filterRating, filterDate]);

  const resetFilters = React.useCallback(() => {
    setFilterTeacher("");
    setFilterStudent("");
    setFilterRating("");
    setFilterDate("");
    setLocalSearch("");
    updateSearchTerm("teacherReview", "");
    setOpenPopover(null);
  }, [updateSearchTerm]);

  // When user types in input: update local immediately and notify parent
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    updateSearchTerm("teacherReview", value);
  };

  // ---- table column control ----
  const showStudentCol = !isStudentRole;
  const showTeacherCol = !isTeacherRole;
  const visibleCols =
    1 /* ID */ +
    (showTeacherCol ? 1 : 0) +
    (showStudentCol ? 1 : 0) +
    1 /* rating */ +
    1 /* review */ +
    1 /* date */;

  if (loading) return <div className="text-gray-300">Loading reviews...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

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
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Star className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={resetFilters}
          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
        >
          Reset filter
        </button>
      </div>

      {/* results table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-700" ref={containerRef}>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>

              {showTeacherCol && (
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase relative">
                  <div className="flex items-center gap-1">
                    <span>TEACHER</span>
                    <button
                      aria-label="Filter by teacher"
                      onClick={() => setOpenPopover(openPopover === "teacher" ? null : "teacher")}
                      className="cursor-pointer"
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  <AnimatePresence>
                    {openPopover === "teacher" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute z-20 mt-2 w-48 bg-white border rounded shadow-lg p-3 pointer-events-auto"
                      >
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Teacher</label>
                        <select
                          aria-label="Select teacher to filter"
                          value={filterTeacher}
                          onChange={(e) => setFilterTeacher(e.target.value)}
                          className="w-full border p-2 rounded text-gray-900"
                        >
                          <option value="">All</option>
                          {teacherOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </th>
              )}

              {showStudentCol && (
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase relative">
                  <div className="flex items-center gap-1">
                    <span>STUDENT</span>
                    <button
                      aria-label="Filter by student"
                      onClick={() => setOpenPopover(openPopover === "student" ? null : "student")}
                      className="cursor-pointer"
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  <AnimatePresence>
                    {openPopover === "student" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute z-20 mt-2 w-48 bg-white border rounded shadow-lg p-3 pointer-events-auto"
                      >
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Student</label>
                        <select
                          aria-label="Select student to filter"
                          value={filterStudent}
                          onChange={(e) => setFilterStudent(e.target.value)}
                          className="w-full border p-2 rounded text-gray-900"
                        >
                          <option value="">All</option>
                          {studentOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </th>
              )}

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase relative">
                <div className="flex items-center gap-1">
                  <span>RATING</span>
                  <button
                    aria-label="Filter by rating"
                    onClick={() => setOpenPopover(openPopover === "rating" ? null : "rating")}
                    className="cursor-pointer"
                  >
                    <Filter className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <AnimatePresence>
                  {openPopover === "rating" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute z-20 mt-2 w-44 bg-white border rounded shadow-lg p-3 pointer-events-auto"
                    >
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
                      <select
                        aria-label="Select rating to filter"
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="w-full border p-2 rounded text-gray-900"
                      >
                        <option value="">All</option>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {"★".repeat(rating)} ({rating})
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">REVIEW</th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase relative">
                <div className="flex items-center gap-1">
                  <span>DATE</span>
                  <button
                    aria-label="Filter by date"
                    onClick={() => setOpenPopover(openPopover === "date" ? null : "date")}
                    className="cursor-pointer"
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <AnimatePresence>
                  {openPopover === "date" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute z-20 mt-2 w-44 bg-white border rounded shadow-lg p-3 pointer-events-auto"
                    >
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                      <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full border p-2 rounded text-gray-900"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-3 text-sm text-gray-300">{review.id}</td>
                  {showTeacherCol && <td className="px-3 py-3 text-sm text-gray-300">{review.teacher_name}</td>}
                  {showStudentCol && <td className="px-3 py-3 text-sm text-gray-300">{review.student_name}</td>}
                  <td className="px-3 py-3 text-sm text-yellow-400">
                    {"★".repeat(Math.round(review.rating))}
                    {"☆".repeat(5 - Math.round(review.rating))}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-300 break-words">{review.review_content}</td>
                  <td className="px-3 py-3 text-sm text-gray-300">{formatDate(normalizeDate(review.review_date))}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleCols} className="py-8 text-center text-gray-400">
                  No reviews found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
