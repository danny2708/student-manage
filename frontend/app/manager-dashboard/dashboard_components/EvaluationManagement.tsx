"use client";

import * as React from "react";
import { Settings, Filter } from "lucide-react";
import { useEvaluations } from "../../../src/hooks/useEvaluation";
import { motion, AnimatePresence } from "framer-motion";

interface EvaluationManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
}

export default function EvaluationManagement({
  searchTerm,
  updateSearchTerm,
}: EvaluationManagementProps) {
  const { evaluations, loading, error, fetchAllEvaluations } = useEvaluations();

  React.useEffect(() => {
    fetchAllEvaluations();
  }, [fetchAllEvaluations]);

  // State cho dropdown filter
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [filterStudent, setFilterStudent] = React.useState("");
  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterType, setFilterType] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");

  // Lấy danh sách duy nhất cho các dropdown options
  const studentOptions = React.useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.student))).filter(Boolean);
  }, [evaluations]);

  const teacherOptions = React.useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.teacher))).filter(Boolean);
  }, [evaluations]);

  const typeOptions = React.useMemo(() => {
    return Array.from(new Set(evaluations.map((e) => e.type))).filter(Boolean);
  }, [evaluations]);

  // Lọc evaluations theo toàn bộ tiêu chí
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      (evaluation.student ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evaluation.teacher ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evaluation.type ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStudent = filterStudent ? evaluation.student === filterStudent : true;
    const matchesTeacher = filterTeacher ? evaluation.teacher === filterTeacher : true;
    const matchesType = filterType ? evaluation.type === filterType : true;
    const matchesDate = filterDate ? evaluation.date === filterDate : true;

    return matchesSearch && matchesStudent && matchesTeacher && matchesType && matchesDate;
  });

  const resetFilters = () => {
    setFilterStudent("");
    setFilterTeacher("");
    setFilterType("");
    setFilterDate("");
    updateSearchTerm("evaluation", "");
  };

  if (loading) return <div className="text-gray-300">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Evaluation Management</h2>
      </div>

      <div className="text-gray-900 flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search evaluations..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("evaluation", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              {/* Type Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <select
                  aria-label="Filter by type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <input
                  type="date"
                  aria-label="Filter by date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border p-2 rounded w-full"
                />
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

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">STUDENT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TEACHER</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TYPE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {filteredEvaluations.length > 0 ? (
              filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.teacher}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        evaluation.type === "discipline"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {evaluation.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No evaluations found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}