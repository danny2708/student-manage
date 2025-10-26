"use client";

import * as React from "react";
import { Star, Filter, Calendar as CalendarIcon } from "lucide-react";
import { useTeacherReviews } from "../../../src/hooks/useTeacherReview";
import { useAuth } from "../../../src/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../../components/ui/input";

interface PopoverPosition { left: number; top: number; show: boolean }

interface TeacherReviewManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
}

export default function TeacherReviewManagement({ searchTerm, updateSearchTerm }: TeacherReviewManagementProps) {
  const { reviews, loading, error, fetchAllReviews } = useTeacherReviews();
  const { user } = useAuth?.() ?? { user: null };

  React.useEffect(() => { fetchAllReviews(); }, [fetchAllReviews]);

  const [localSearch, setLocalSearch] = React.useState(searchTerm ?? "");
  React.useEffect(() => setLocalSearch(searchTerm ?? ""), [searchTerm]);

  const getRoleNames = React.useCallback((roles: any): string[] => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles.map(r => typeof r === "string" ? r : r?.name ?? r?.role ?? "").filter(Boolean).map(String);
    if (typeof roles === "string") return [roles];
    if (typeof roles === "object" && roles !== null) return roles.name ? [String(roles.name)] : [];
    return [];
  }, []);

  const roleNames = React.useMemo(() => getRoleNames(user?.roles), [user?.roles, getRoleNames]);
  const isTeacherRole = roleNames.includes("teacher");
  const isStudentRole = roleNames.includes("student");

  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterStudent, setFilterStudent] = React.useState("");
  const [filterRating, setFilterRating] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");
  const [openPopover, setOpenPopover] = React.useState<null | "teacher" | "student" | "rating" | "date">(null);

  const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const teacherOptions = React.useMemo(() => Array.from(new Set(reviews.map(r => r.teacher_name).filter(Boolean))), [reviews]);
  const studentOptions = React.useMemo(() => Array.from(new Set(reviews.map(r => r.student_name).filter(Boolean))), [reviews]);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpenPopover(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filteredReviews = React.useMemo(() => reviews.filter(review => {
    const matchesSearch = !localSearch ||
      (review.review_content ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
      (review.teacher_name ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
      (review.student_name ?? "").toLowerCase().includes(localSearch.toLowerCase());
    const matchesTeacher = filterTeacher ? review.teacher_name === filterTeacher : true;
    const matchesStudent = filterStudent ? review.student_name === filterStudent : true;
    const matchesRating = filterRating ? Math.round(review.rating) === Number(filterRating) : true;
    const matchesDate = filterDate ? review.review_date?.split("T")[0] === filterDate : true;
    return matchesSearch && matchesTeacher && matchesStudent && matchesRating && matchesDate;
  }), [reviews, localSearch, filterTeacher, filterStudent, filterRating, filterDate]);

  const resetFilters = React.useCallback(() => {
    setFilterTeacher(""); setFilterStudent(""); setFilterRating(""); setFilterDate(""); setLocalSearch("");
    updateSearchTerm("teacherReview", ""); setOpenPopover(null);
  }, [updateSearchTerm]);

  const handleSearchChange = (value: string) => { setLocalSearch(value); updateSearchTerm("teacherReview", value); };

  const showStudentCol = !isStudentRole;
  const showTeacherCol = !isTeacherRole;
  const visibleCols = 1 + (showTeacherCol ? 1 : 0) + (showStudentCol ? 1 : 0) + 1 + 1 + 1;

  const getPopoverPosition = (filterName: "teacher" | "student" | "rating" | "date"): PopoverPosition => {
    const button = filterButtonRefs.current[filterName];
    if (!button || !rootRef.current) return { left: 0, top: 0, show: false };
    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    return { left: buttonRect.left - rootRect.left, top: buttonRect.bottom - rootRect.top + 5, show: openPopover === filterName };
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("vi-VN") : "";

  if (loading) return <div className="text-gray-500">Loading reviews...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6 relative p-4 bg-white rounded-lg shadow-lg" ref={rootRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-black">Teacher Review Management</h2>
      </div>

      {/* Search + Reset */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search reviews..."
            value={localSearch}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black"
          />
          <Star className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button onClick={resetFilters} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors">Reset Filters</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase border-r border-gray-200">ID</th>
              {showTeacherCol && <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase border-r border-gray-200">
                <div className="flex items-center gap-2">
                  TEACHER
                  <button
                    ref={el => { filterButtonRefs.current.teacher = el; }}
                    onClick={() => setOpenPopover(openPopover==="teacher"?null:"teacher")}
                    aria-label="Filter by teacher"
                  >
                    <Filter className="h-4 w-4 text-black ml-1 cursor-pointer"/>
                  </button>
                </div>
              </th>}
              {showStudentCol && <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase border-r border-gray-200">
                <div className="flex items-center gap-2">
                  STUDENT
                  <button
                    ref={el => { filterButtonRefs.current.student = el; }}
                    onClick={() => setOpenPopover(openPopover==="student"?null:"student")}
                    aria-label="Filter by student"
                  >
                    <Filter className="h-4 w-4 text-black ml-1 cursor-pointer"/>
                  </button>
                </div>
              </th>}
              <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase border-r border-gray-200">
                <div className="flex items-center gap-2">
                  RATING
                  <button
                    ref={el => { filterButtonRefs.current.rating = el; }}
                    onClick={() => setOpenPopover(openPopover==="rating"?null:"rating")}
                    aria-label="Filter by rating"
                  >
                    <Filter className="h-4 w-4 text-black ml-1 cursor-pointer"/>
                  </button>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase border-r border-gray-200">REVIEW</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-black uppercase">
                <div className="flex items-center gap-2">
                  DATE
                  <button
                    ref={el => { filterButtonRefs.current.date = el; }}
                    onClick={() => setOpenPopover(openPopover==="date"?null:"date")}
                    aria-label="Filter by date"
                  >
                    <CalendarIcon className="h-4 w-4 text-black ml-1 cursor-pointer"/>
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReviews.length > 0 ? filteredReviews.map(r => (
              <tr key={r.id} className="hover:bg-gray-100 cursor-pointer transition-colors">
                <td className="px-3 py-3 text-sm text-black border-r border-gray-200">{r.id}</td>
                {showTeacherCol && <td className="px-3 py-3 text-sm text-black border-r border-gray-200">{r.teacher_name}</td>}
                {showStudentCol && <td className="px-3 py-3 text-sm text-black border-r border-gray-200">{r.student_name}</td>}
                <td className="px-3 py-3 text-sm text-yellow-600 border-r border-gray-200">
                  {"★".repeat(Math.round(r.rating))}{"☆".repeat(5-Math.round(r.rating))}
                </td>
                <td className="px-3 py-3 text-sm text-black border-r border-gray-200 break-words">{r.review_content}</td>
                <td className="px-3 py-3 text-sm text-black">{formatDate(r.review_date)}</td>
              </tr>
            )) : <tr><td colSpan={visibleCols} className="py-8 text-center text-gray-400">No reviews found matching your criteria.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Popovers */}
      <AnimatePresence>
        {["teacher","student","rating","date"].map(filterName => {
          const pos = getPopoverPosition(filterName as any);
          if(!pos.show) return null;
          let options: string[] = [];
          let value = "";
          let label = "";
          switch(filterName){
            case "teacher": options = teacherOptions; value = filterTeacher; label="Teacher"; break;
            case "student": options = studentOptions; value = filterStudent; label="Student"; break;
            case "rating": options = ["5","4","3","2","1"]; value = filterRating; label="Rating"; break;
            case "date": options = []; value = filterDate; label="Date"; break;
          }
          return (
            <motion.div key={filterName} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
              style={{position:'absolute',top:pos.top,left:pos.left,minWidth:'200px'}} className="z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <label className="text-sm font-semibold mb-1 block">{label}</label>
              {filterName==="date"?(
                <Input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="w-full border p-2 rounded text-black"/>
              ):(
                <select className="w-full border p-2 rounded text-black" value={value} aria-label={label}
                  onChange={e=>{
                    if(filterName==="teacher") setFilterTeacher(e.target.value);
                    if(filterName==="student") setFilterStudent(e.target.value);
                    if(filterName==="rating") setFilterRating(e.target.value);
                  }}>
                  <option value="">All</option>
                  {options.map(opt=> filterName==="rating"?
                    <option key={opt} value={opt}>{"★".repeat(Number(opt))} ({opt})</option>:
                    <option key={opt} value={opt}>{opt}</option>
                  )}
                </select>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  );
}
