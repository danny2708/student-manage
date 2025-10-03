"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { X, User as UserIcon, Calendar, Clock, CheckCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

import { useEvaluations } from "../../src/hooks/useEvaluation";
import type { EvaluationCreate, EvaluationRecord } from "../../src/services/api/evaluation";

/**
 * CreateEvaluationModal - full form
 * Props:
 *  - onClose: close modal
 *  - onCreated: (rec?) => void  -> callback after creation (returns created record)
 */
export default function CreateEvaluationModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r?: EvaluationRecord) => void; }) {
  const { addEvaluation } = useEvaluations();

  // student search
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<{ id: number; name: string }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string } | null>(null);

  // fields
  const [classId, setClassId] = useState<number | "">("");
  const [studyPoint, setStudyPoint] = useState<number | "">("");
  const [disciplinePoint, setDisciplinePoint] = useState<number | "">("");
  const [evaluationType, setEvaluationType] = useState<string>("REGULAR");
  const [evaluationContent, setEvaluationContent] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      (async () => {
        if (!studentQuery) {
          setStudentResults([]);
          return;
        }
        try {
          const res = await fetch(`/api/users?role=student&search=${encodeURIComponent(studentQuery)}`);
          if (!res.ok) return;
          const json = await res.json();
          // expect [{id, name}]
          setStudentResults(json);
        } catch (err) {
          console.error("student search failed", err);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [studentQuery]);

  const handleSubmit = async () => {
    if (!selectedStudent) {
      setErrorMessage("Please choose a student.");
      return;
    }
    setErrorMessage("");
    setSubmitting(true);

    const payload: EvaluationCreate = {
      student_user_id: selectedStudent.id,
      study_point: Number(studyPoint || 0),
      class_id: Number(classId || 0),
      discipline_point: Number(disciplinePoint || 0),
      evaluation_type: evaluationType as any,
      evaluation_content: evaluationContent || undefined,
    };

    try {
      const rec = await addEvaluation(payload);
      if (rec) {
        onCreated(rec as EvaluationRecord);
        onClose();
      } else {
        // addEvaluation already shows toast on failure
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex justify-center items-center z-50 cursor-pointer bg-black/30"
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-96 p-6 text-black relative cursor-default border border-gray-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-600" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Create New Evaluation</h2>

          <div className="space-y-4">
            {/* Student search */}
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <UserIcon className="w-4 h-4 text-blue-500" />
                Student
              </label>

              <div className="relative">
                <Input
                  value={selectedStudent ? selectedStudent.name : studentQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setStudentQuery(e.target.value);
                    setSelectedStudent(null);
                  }}
                  placeholder="Search student by name or id..."
                />
                <SearchIcon className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              {studentResults.length > 0 && !selectedStudent && (
                <div className="border border-gray-200 rounded-md mt-1 bg-white shadow-sm max-h-40 overflow-auto z-40">
                  {studentResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStudent(s);
                        setStudentResults([]);
                        setStudentQuery("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {s.name} (#{s.id})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Class / Points */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  <Calendar className="inline-block mr-2" /> Class ID
                </label>
                <Input value={classId as any} onChange={(e) => setClassId(Number(e.target.value || ""))} />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  <CheckCircle className="inline-block mr-2" /> Study point
                </label>
                <Input type="number" value={studyPoint as any} onChange={(e) => setStudyPoint(Number(e.target.value || ""))} />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  <Clock className="inline-block mr-2" /> Discipline point
                </label>
                <Input type="number" value={disciplinePoint as any} onChange={(e) => setDisciplinePoint(Number(e.target.value || ""))} />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <select value={evaluationType} onChange={(e) => setEvaluationType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black" aria-label="Evaluation Type">
                <option value="REGULAR">Regular</option>
                <option value="EXAM">Exam</option>
                <option value="QUIZ">Quiz</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Content
              </label>
              <textarea
                value={evaluationContent}
                onChange={(e) => setEvaluationContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                rows={4}
                placeholder="Enter evaluation content..."
                title="Evaluation Content"
              />
            </div>
          </div>

          {errorMessage && <p className="text-red-600 text-sm mt-4 text-center">{errorMessage}</p>}

          <div className="flex justify-center mt-6">
            <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg cursor-pointer">
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* small wrapper: using lucide's Search icon but renamed to avoid import clashing */
function SearchIcon(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
}
