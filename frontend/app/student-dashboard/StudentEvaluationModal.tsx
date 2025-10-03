"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Search,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  AlertTriangle,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { useEvaluations } from "../../src/hooks/useEvaluation";
import { toast } from "react-hot-toast";

interface StudentEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "student" | "parent" | "teacher" | "manager";
  studentUserId?: number;
  classId?: number;
}

const formatDateDMY = (ymd?: string) => {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

const getGradeFromScore = (score?: number, max?: number) => {
  if (score == null || max == null) return null;
  const pct = (score / max) * 100;
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  return "D";
};

const getGradeColor = (grade: string | null) => {
  if (!grade) return "bg-gray-100 text-gray-800";
  if (grade.startsWith("A")) return "bg-green-100 text-green-800";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-800";
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const getTypeIcon = (type: string | undefined) => {
  switch (type) {
    case "initial":
    case "exam":
      return <BookOpen className="w-4 h-4" />;
    case "study":
    case "assignment":
      return <Star className="w-4 h-4" />;
    case "quiz":
    case "progress":
      return <TrendingUp className="w-4 h-4" />;
    case "discipline":
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string | undefined) => {
  switch (type) {
    case "initial":
    case "exam":
      return "bg-purple-100 text-purple-800";
    case "study":
    case "assignment":
      return "bg-blue-100 text-blue-800";
    case "quiz":
    case "progress":
      return "bg-green-100 text-green-800";
    case "discipline":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function StudentEvaluationModal({
  isOpen,
  onClose,
  userRole,
  studentUserId,
  classId,
}: StudentEvaluationModalProps) {
  const {
    evaluations,
    loading,
    fetchAllEvaluations,
    fetchEvaluationsOfStudent,
    fetchEvaluationsOfStudentInClass,
    fetchEvaluationRecord,
    fetchEvaluationsSummaryOfStudentInClass,
    fetchTotalScore,
    removeEvaluation,
  } = useEvaluations();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStudent, setFilterStudent] = useState<string>("all"); // NEW
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [localList, setLocalList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [fetching, setFetching] = useState(false);

  // Fetch evaluations when modal opens (choose endpoint based on props)
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    (async () => {
      setFetching(true);
      try {
        if (studentUserId && classId) {
          const list = await fetchEvaluationsOfStudentInClass(studentUserId, classId);
          if (active && list) setLocalList(list);
          // try fetch summary for student in class if available
          try {
            const s = await fetchEvaluationsSummaryOfStudentInClass(studentUserId, classId);
            if (active) setSummary(s);
          } catch (err) {
            // ignore summary error — optional endpoint
          }
        } else if (studentUserId) {
          const list = await fetchEvaluationsOfStudent(studentUserId);
          if (active && list) setLocalList(list);
          // try total score
          try {
            const s = await fetchTotalScore(studentUserId);
            if (active) setSummary(s);
          } catch {}
        } else {
          await fetchAllEvaluations();
          // use global hook evaluations array
          // (useEvaluations sets evaluations in hook; copy below)
          // small delay until evaluations populated
        }
      } catch (err) {
        console.error("Failed to fetch evaluations for modal:", err);
      } finally {
        setFetching(false);
      }
    })();

    return () => {
      active = false;
      setSelectedEvaluation(null);
      setLocalList([]);
      setFilterStudent("all");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentUserId, classId]);

  // If hook `evaluations` is populated and localList empty & no studentUserId, use it
  useEffect(() => {
    if (!studentUserId && evaluations && evaluations.length && isOpen) {
      setLocalList(evaluations);
    }
  }, [evaluations, studentUserId, isOpen]);

  // derive subjects and types from localList
  const subjects = useMemo(
    () => ["all", ...Array.from(new Set(localList.map((l) => l.class_name || l.subject || "Unknown")))],
    [localList]
  );
  const types = useMemo(
    () => ["all", ...Array.from(new Set(localList.map((l) => l.type || "other")))],
    [localList]
  );

  // NEW: derive students (only from localList). Value uses student_user_id if available.
  const students = useMemo(() => {
    const map = new Map<string, string>(); // value -> label
    localList.forEach((l) => {
      const id = l.student_user_id != null ? String(l.student_user_id) : null;
      const label = l.student || (id ? `#${id}` : "Unknown");
      const key = id || label;
      if (!map.has(key)) map.set(key, label);
    });
    const arr = [{ value: "all", label: "All Students" }, ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))];
    return arr;
  }, [localList]);

  const filteredEvaluations = useMemo(() => {
    const sTerm = searchTerm?.trim().toLowerCase();
    return (localList || []).filter((ev: any) => {
      const matchesSearch =
        !sTerm ||
        (ev.content && ev.content.toLowerCase().includes(sTerm)) ||
        (ev.teacher && ev.teacher.toLowerCase().includes(sTerm)) ||
        (ev.class_name && ev.class_name.toLowerCase().includes(sTerm));
      const matchesSubject = filterSubject === "all" || (ev.class_name || ev.subject) === filterSubject;
      const matchesType = filterType === "all" || (ev.type || "other") === filterType;

      // NEW: student filter logic
      const matchesStudent =
        filterStudent === "all" ||
        (ev.student_user_id != null && String(ev.student_user_id) === filterStudent) ||
        (ev.student != null && ev.student === filterStudent);

      return matchesSearch && matchesSubject && matchesType && matchesStudent;
    });
  }, [localList, searchTerm, filterSubject, filterType, filterStudent]);

  const handleSelect = async (ev: any) => {
    if (!ev) {
      setSelectedEvaluation(null);
      return;
    }
    // attempt to fetch full record if API provides detailed record
    if (ev.id && fetchEvaluationRecord) {
      try {
        const rec = await fetchEvaluationRecord(ev.id);
        // merge rec into ev (if fields differ)
        setSelectedEvaluation({ ...ev, ...rec });
      } catch (err) {
        // fallback to ev
        setSelectedEvaluation(ev);
      }
    } else {
      setSelectedEvaluation(ev);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this evaluation?")) return;
    try {
      await removeEvaluation(id);
      toast.success("Deleted evaluation");
      // remove locally
      setLocalList((prev) => prev.filter((p) => p.id !== id));
      setSelectedEvaluation(null);
    } catch (err) {
      toast.error("Failed to delete");
      console.error(err);
    }
  };

  const handleExport = async () => {
    if (!selectedEvaluation) return;
    let payload = selectedEvaluation;
    // try to fetch full record for export if possible
    if (selectedEvaluation.id && fetchEvaluationRecord) {
      try {
        const rec = await fetchEvaluationRecord(selectedEvaluation.id);
        if (rec) payload = { ...selectedEvaluation, record: rec };
      } catch {}
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-${selectedEvaluation.id || "export"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Evaluation History</h2>
              <p className="text-blue-100 mt-1">
                {userRole === "student" && "View your academic evaluations and content"}
                {userRole === "parent" && "Monitor your children's academic progress"}
                {userRole === "teacher" && "Manage student evaluations and grades"}
                {userRole === "manager" && "Overview of all evaluations and performance metrics"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search evaluations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* NEW: Student filter - shown only when userRole is not 'student' */}
            {userRole !== "student" && (
              <Select value={filterStudent} onValueChange={(v) => setFilterStudent(v)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All Classes" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(v) => setFilterType(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "all" ? "All Types" : ("" + t).charAt(0).toUpperCase() + ("" + t).slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Evaluations List */}
          <div className="w-1/2 border-r border-gray-200 overflow-auto">
            <div className="p-4 space-y-3">
              {loading || fetching ? (
                <div className="text-gray-500 p-4">Loading evaluations...</div>
              ) : filteredEvaluations.length === 0 ? (
                <div className="text-center p-6 text-gray-500">No evaluations found.</div>
              ) : (
                filteredEvaluations.map((evaluation: any) => {
                  const grade = getGradeFromScore(evaluation.score, evaluation.maxScore);
                  return (
                    <Card
                      key={evaluation.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedEvaluation?.id === evaluation.id ? "ring-2 ring-blue-500 shadow-md" : ""}`}
                      onClick={() => handleSelect(evaluation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${getTypeColor(evaluation.type)}`}>
                              {getTypeIcon(evaluation.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{evaluation.class_name || evaluation.subject || "Class"}</h3>
                              <p className="text-sm text-gray-600">{evaluation.teacher}</p>
                            </div>
                          </div>
                          {grade && (
                            <Badge className={getGradeColor(grade)}>{grade}</Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{evaluation.content}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDateDMY(evaluation.date)}</span>
                          <div className="flex items-center space-x-3">
                            {evaluation.score != null && evaluation.maxScore != null && (
                              <span className="font-medium">
                                {evaluation.score}/{evaluation.maxScore}
                              </span>
                            )}
                            {evaluation.study_point > 0 && <span className="text-green-600">{evaluation.study_point} SP</span>}
                            {evaluation.discipline_point > 0 && <span className="text-red-600">{evaluation.discipline_point} DP</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Evaluation Details */}
          <div className="w-1/2 overflow-auto">
            {selectedEvaluation ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(selectedEvaluation.type)}`}>
                        {getTypeIcon(selectedEvaluation.type)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedEvaluation.class_name || selectedEvaluation.subject || "Class"}</h2>
                        <p className="text-gray-600">{selectedEvaluation.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      {userRole === "teacher" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(selectedEvaluation.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Score and Grade */}
                  {selectedEvaluation.score != null && selectedEvaluation.maxScore != null && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">{selectedEvaluation.score}</div>
                          <div className="text-sm text-gray-600">out of {selectedEvaluation.maxScore}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {getGradeFromScore(selectedEvaluation.score, selectedEvaluation.maxScore)}
                          </div>
                          <div className="text-sm text-gray-600">Grade</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Points with unified color logic, smaller cards */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      {
                        label: "Study Points",
                        value: selectedEvaluation.study_point ?? selectedEvaluation.studyPoints ?? 0,
                        icon: <Award />,
                      },
                      {
                        label: "Discipline Points",
                        value: selectedEvaluation.discipline_point ?? selectedEvaluation.disciplinePoints ?? 0,
                        icon: <AlertTriangle />,
                      },
                    ].map((p) => {
                      const isPositive = p.value >= 0;
                      const colorBg = isPositive ? "bg-green-100" : "bg-red-100";
                      const colorText = isPositive ? "text-green-600" : "text-red-600";
                      return (
                        <Card key={p.label} className="text-center">
                          <CardContent className="p-2 text-center">
                            <div className={`p-3 rounded-lg inline-flex items-center justify-center mb-1 ${colorBg}`}>
                              {React.cloneElement(p.icon, { className: `${colorText} w-5 h-5` })}
                            </div>
                            <div className={`text-lg font-bold ${colorText}`}>{p.value}</div>
                            <div className="text-sm text-gray-600">{p.label}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Evaluation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-gray-600">Teacher:</span>
                        <span className="text-gray-900">{selectedEvaluation.teacher}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-gray-600">Date:</span>
                        <span className="text-gray-900">{formatDateDMY(selectedEvaluation.date)}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-gray-600">Type:</span>
                        <span className="text-gray-900 capitalize">{selectedEvaluation.type}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-gray-600">Class:</span>
                        <span className="text-gray-900">{selectedEvaluation.class_name}</span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-gray-600">Student ID:</span>
                        <span className="text-gray-900">
                          {selectedEvaluation.student_user_id}
                        </span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-gray-600">Student:</span>
                        <span className="text-gray-900">
                          {selectedEvaluation.student}
                        </span>
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className="font-medium text-gray-600">Content:</span>
                        <span className="text-gray-900">{selectedEvaluation.content || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Evaluation</h3>
                  <p className="text-gray-600">Choose an evaluation from the list to view details</p>
                  {summary && (
                    <div className="mt-4 text-sm text-gray-700">
                      <div>Final Study Points: <strong>{summary.final_study_point ?? summary.finalStudyPoint ?? 0}</strong></div>
                      <div>Final Discipline Points: <strong>{summary.final_discipline_point ?? summary.finalDisciplinePoint ?? 0}</strong></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { StudentEvaluationModal };
