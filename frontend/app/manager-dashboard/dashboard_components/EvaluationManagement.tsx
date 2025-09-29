"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { useEvaluations } from "../../../src/hooks/useEvaluation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../src/contexts/AuthContext";
import { Input } from "../../../components/ui/input";

interface EvaluationManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
}

// Format date for display: YYYY-MM-DD → dd/mm/yyyy
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

// Normalize to YYYY-MM-DD for filtering
const normalizeDate = (dateString: string) => {
  if (!dateString) return "";
  // Check if date is already in YYYY-MM-DD format (e.g. from filterDate state)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
  
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export default function EvaluationManagement({
  searchTerm,
  updateSearchTerm,
}: EvaluationManagementProps) {
  const { evaluations, loading, error, fetchAllEvaluations } = useEvaluations();
  const { user } = useAuth();

    React.useEffect(() => {
    fetchAllEvaluations()
      .then(() => {
        console.log("Evaluations fetched successfully");
      })
      .catch((err) => {
        console.error("Error fetching evaluations:", err);
      });
  }, [fetchAllEvaluations]);


  // === LOCAL search state to ensure immediate typing feedback ===
  const [localSearch, setLocalSearch] = React.useState<string>(searchTerm ?? "");
  // keep local in sync if parent changes the prop externally
  React.useEffect(() => {
    setLocalSearch(searchTerm ?? "");
  }, [searchTerm]);

  // normalize roles into array of strings
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

  // filter states
  const [filterStudent, setFilterStudent] = React.useState("");
  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterType, setFilterType] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");

  // which popover is open
  const [openPopover, setOpenPopover] = React.useState<null | "student" | "teacher" | "type" | "date">(null);

  // Refs for filter buttons to calculate popover position
  const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  // derived option lists
  const studentOptions = React.useMemo(() => Array.from(new Set(evaluations.map((e) => e.student).filter(Boolean))), [evaluations]);
  const teacherOptions = React.useMemo(() => Array.from(new Set(evaluations.map((e) => e.teacher).filter(Boolean))), [evaluations]);
  const typeOptions = React.useMemo(() => Array.from(new Set(evaluations.map((e) => e.type).filter(Boolean))), [evaluations]);

  // Ref cho toàn bộ khu vực quản lý để đóng popover khi click ra ngoài
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // click outside to close popovers
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      // Close popover if click is outside the entire component (or specific popovers)
      if (!rootRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);


  // Filter logic + search
  const filteredEvaluations = React.useMemo(() => {
    return evaluations.filter((evaluation) => {
      const matchesSearch =
        !localSearch ||
        (evaluation.student ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
        (evaluation.teacher ?? "").toLowerCase().includes(localSearch.toLowerCase()) ||
        (evaluation.type ?? "").toLowerCase().includes(localSearch.toLowerCase());

      const matchesStudent = filterStudent ? evaluation.student === filterStudent : true;
      const matchesTeacher = filterTeacher ? evaluation.teacher === filterTeacher : true;
      const matchesType = filterType ? evaluation.type === filterType : true;
      // Use normalizeDate on both sides to handle potential date format inconsistencies
      const matchesDate = filterDate ? normalizeDate(evaluation.date) === filterDate : true;

      return matchesSearch && matchesStudent && matchesTeacher && matchesType && matchesDate;
    });
  }, [evaluations, localSearch, filterStudent, filterTeacher, filterType, filterDate]);

  const resetFilters = React.useCallback(() => {
    setFilterStudent("");
    setFilterTeacher("");
    setFilterType("");
    setFilterDate("");
    setLocalSearch("");
    updateSearchTerm("evaluation", "");
    setOpenPopover(null);
  }, [updateSearchTerm]);

  // When user types in input: update local immediately (for instant UI), and also notify parent
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    // notify parent — synchronous call; parent might be debounced but UI is responsive due to localSearch
    updateSearchTerm("evaluation", value);
  };

  if (loading) return <div className="text-gray-300">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const showStudentCol = !isStudentRole;
  const showTeacherCol = !isTeacherRole;
  const visibleCols = 1 /* ID */ + (showStudentCol ? 1 : 0) + (showTeacherCol ? 1 : 0) + 1 /* TYPE */ + 1 /* DATE */;

  // Function to calculate popover position relative to the root div
  const getPopoverPosition = (filterName: "student" | "teacher" | "type" | "date") => {
    const button = filterButtonRefs.current[filterName];
    if (!button || !rootRef.current) return { left: 0, top: 0, show: false };

    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();

    // The popover should appear right below the button
    const top = buttonRect.bottom - rootRect.top + 5; // +5px margin
    
    // Position it slightly to the left relative to the button
    const left = buttonRect.left - rootRect.left;

    return { left, top, show: openPopover === filterName };
  };

  return (
    // Make the root div relative for absolute positioning of popovers
    <div className="space-y-4 relative" ref={rootRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Evaluation Management</h2>
      </div>

      <div className="text-gray-900 flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search evaluations..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={resetFilters}
          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
        >
          Reset filter
        </button>
      </div>

      {/* Results table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          {/* THEAD does not need the containerRef anymore since popovers are outside */}
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>

              {showStudentCol && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider relative">
                  <div className="flex items-center gap-1">
                    <span>STUDENT</span>
                    <button
                      ref={(el) => { filterButtonRefs.current.student = el; }}
                      onClick={() => setOpenPopover((s) => (s === "student" ? null : "student"))}
                      title="Filter by student"
                      className="cursor-pointer"
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  {/* Popover is MOVED OUTSIDE of <thead> and rendered below */}
                </th>
              )}

              {showTeacherCol && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider relative">
                  <div className="flex items-center gap-1">
                    <span>TEACHER</span>
                    <button
                      ref={(el) => { filterButtonRefs.current.teacher = el; }}
                      onClick={() => setOpenPopover((s) => (s === "teacher" ? null : "teacher"))}
                      title="Filter by teacher"
                      className="cursor-pointer"
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </th>
              )}

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider relative">
                <div className="flex items-center gap-1">
                  <span>TYPE</span>
                  <button
                    ref={(el) => { filterButtonRefs.current.type = el; }}
                    onClick={() => setOpenPopover((s) => (s === "type" ? null : "type"))}
                    title="Filter by type"
                    className="cursor-pointer"
                  >
                    <Filter className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider relative">
                <div className="flex items-center gap-1">
                  <span>DATE</span>
                  <button
                    ref={(el) => { filterButtonRefs.current.date = el; }}
                    onClick={() => setOpenPopover((s) => (s === "date" ? null : "date"))}
                    title="Filter by date"
                    className="cursor-pointer"
                  >
                    <Filter className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-600">
            {filteredEvaluations.length > 0 ? (
              filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.id}</td>
                  {showStudentCol && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.student}</td>}
                  {showTeacherCol && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.teacher}</td>}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${evaluation.type === "discipline" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                      {evaluation.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(evaluation.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleCols} className="py-8 text-center text-gray-400">No evaluations found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* ========================================================================= */}
      {/* POPUP FILTERS RENDERED HERE (outside the table to fix the clipping issue) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* Student Filter Popover */}
        {getPopoverPosition("student").show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: 'absolute',
              top: getPopoverPosition("student").top,
              left: getPopoverPosition("student").left,
              transform: 'translateX(calc(-100% + 40px))' // Shift left to align the right edge with the button
            }}
            className="z-50 mt-2 w-48 bg-white border rounded shadow-lg p-3"
          >
            <label className="text-sm font-medium text-gray-700 mb-1 block">Student</label>
            <select
              aria-label="Filter by student"
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
      
        {/* Teacher Filter Popover */}
        {getPopoverPosition("teacher").show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: 'absolute',
              top: getPopoverPosition("teacher").top,
              left: getPopoverPosition("teacher").left,
              transform: 'translateX(calc(-100% + 40px))' // Shift left
            }}
            className="z-50 mt-2 w-48 bg-white border rounded shadow-lg p-3"
          >
            <label className="text-sm font-medium text-gray-700 mb-1 block">Teacher</label>
            <select
              aria-label="Filter by teacher"
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
        
        {/* Type Filter Popover */}
        {getPopoverPosition("type").show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: 'absolute',
              top: getPopoverPosition("type").top,
              left: getPopoverPosition("type").left,
              transform: 'translateX(calc(-100% + 40px))' // Shift left
            }}
            className="z-50 mt-2 w-44 bg-white border rounded shadow-lg p-3"
          >
            <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
            <select
              aria-label="Filter by type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border p-2 rounded text-gray-900"
            >
              <option value="">All</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </motion.div>
        )}
        
        {/* Date Filter Popover */}
        {getPopoverPosition("date").show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              position: 'absolute',
              top: getPopoverPosition("date").top,
              left: getPopoverPosition("date").left,
              transform: 'translateX(calc(-100% + 40px))' // Shift left
            }}
            className="z-50 mt-2 w-44 bg-white border rounded shadow-lg p-3"
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
    </div>
  );
}