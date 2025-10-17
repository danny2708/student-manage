"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { User, BookOpen, Users, DollarSign, Presentation, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useClasses } from "../../../../src/contexts/ClassContext";
import { useAuth } from "../../../../src/contexts/AuthContext";
import { ActionModal } from "../../showInfo/action_modal";
import { ShowInfoModal } from "../../showInfo/ShowInfoModal";
import { CreateClassForm } from "./CreateClassForm";
import { Class } from "../../../../src/services/api/class";
import { getStudentsInClass, Student } from "../../../../src/services/api/class";
import { useConfirmDialog } from "../../../../src/hooks/useConfirmDialog";
import { ConfirmModal } from "../../../../components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function ClassManagement() {
  const {
    classes,
    loading,
    error,
    removeClass,
    fetchClasses,
    exportClassData,
  } = useClasses();
  const { user } = useAuth();
  const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState<Class | null>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showStudentsModal, setShowStudentsModal] = React.useState(false);

  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterSubject, setFilterSubject] = React.useState("");

  const teachers = Array.from(new Set(classes.map(c => c.teacher_name).filter(Boolean)));
  const subjects = Array.from(new Set(classes.map(c => c.subject_name).filter(Boolean)));

  // normalize roles
  const getRoleNames = (roles: any): string[] => {
    if (!roles) return [];
    if (Array.isArray(roles)) {
      return roles
        .map((r) => (typeof r === "string" ? r : r?.name ?? r?.role ?? ""))
        .filter(Boolean)
        .map((s) => String(s));
    }
    if (typeof roles === "string") return [roles];
    if (typeof roles === "object" && roles !== null) {
      const derived = roles.name ?? roles.role ?? "";
      return derived ? [String(derived)] : [];
    }
    return [];
  };

  const roleNames = getRoleNames(user?.roles);
  const isManager = roleNames.includes("manager");
  const isTeacher = roleNames.includes("teacher");
  const canExport = isManager || isTeacher;

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeacher = filterTeacher ? cls.teacher_name === filterTeacher : true;
    const matchesSubject = filterSubject ? cls.subject_name === filterSubject : true;
    return matchesSearch && matchesTeacher && matchesSubject;
  });

  const handleCardClick = (cls: Class) => {
    setSelectedClass(cls);
    if (isManager) setShowAction(true);
    else setShowInfo(true);
  };

  const handleDelete = async () => {
    if (selectedClass) {
      await removeClass(selectedClass.class_id);
      setShowAction(false);
      closeConfirm();
    }
  };

  const handleShowInfo = () => {
    setShowAction(false);
    setShowInfo(true);
  };

  const handleCreated = async () => {
    await fetchClasses();
  };

  const handleUpdated = async () => {
    await fetchClasses();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>, close: () => void) => {
    if (e.target === e.currentTarget) close();
  };

  const openStudentsModal = (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (!selectedClass) return;
    setShowStudentsModal(true);
  };

  if (loading) return <p className="text-gray-500">Loading classes...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
        {isManager && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            Create New Class
          </motion.button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="text-gray-900 flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <select
          aria-label="Filter by teacher"
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All Teachers</option>
          {teachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          aria-label="Filter by subject"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <motion.div
            key={cls.class_id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCardClick(cls)}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:bg-blue-50 transition-all cursor-pointer border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-blue-700 flex items-center justify-center gap-2 mb-3">
              <Presentation className="w-6 h-6 text-blue-600" />
              {cls.class_name ?? "—"}
            </h2>
            <hr className="border-gray-300 mb-4" />
            <div className="space-y-3 text-gray-900">
              <div className="flex items-center justify-between text-gray-900">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-900" />
                  <span>Teacher:</span>
                </div>
                <span className="font-medium text-gray-900">{cls.teacher_name ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-90">
                  <BookOpen className="w-4 h-4 text-gray-900" />
                  <span>Subject:</span>
                </div>
                <span className="font-medium text-gray-900">{cls.subject_name ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900">
                  <Users className="w-4 h-4 text-gray-900" />
                  <span>Capacity:</span>
                </div>
                <span className="font-medium text-gray-900">{cls.capacity ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900">
                  <DollarSign className="w-4 h-4" />
                  <span>Fee:</span>
                </div>
                <span className="font-medium text-gray-900">{cls.fee?.toLocaleString() ?? "—"}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {showAction && selectedClass && isManager && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowAction(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ActionModal
              onClose={() => setShowAction(false)}
              onShowInfo={handleShowInfo}
              onDelete={
                isManager
                  ? () => openConfirm(
                      `Are you sure to delete ${selectedClass.class_name}?`,
                      handleDelete
                    )
                  : undefined
              }
              userRoles={user?.roles}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show Info Modal */}
      <AnimatePresence>
        {showInfo && selectedClass && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowInfo(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ShowInfoModal
              type="class"
              data={selectedClass}
              onClose={() => setShowInfo(false)}
              onUpdated={handleUpdated}
              userRoles={roleNames}
              extraActions={
                canExport ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openStudentsModal(e);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors ml-2"
                  >
                    View students list
                  </button>
                ) : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Students Modal */}
      <StudentsModal
        open={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        classId={selectedClass?.class_id ?? null}
        classNameLabel={selectedClass?.class_name ?? ""}
        canExport={canExport}
        onExport={() => {
          if (!selectedClass) return;
          return exportClassData(selectedClass.class_id);
        }}
      />

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && isManager && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => handleBackdropClick(e, () => setShowCreateModal(false))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CreateClassForm
              onClose={() => setShowCreateModal(false)}
              onCreated={handleCreated}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ConfirmModal */}
          <ConfirmModal
            isOpen={isOpen}
            message={message}
            onConfirm={() => {
              onConfirm();
              closeConfirm();
            }}
            onCancel={closeConfirm}
          />
    </div>
  );
}

interface StudentsModalProps {
  open: boolean
  onClose: () => void
  classId: number | null
  classNameLabel?: string
  canExport?: boolean
  onExport?: () => Promise<void> | void
}

const StudentsModalInner: React.FC<StudentsModalProps> = ({ open, onClose, classId, classNameLabel, canExport, onExport }) => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (!classId) {
      setStudents([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getStudentsInClass(classId);
        if (cancelled) return;
        setStudents(data ?? []);
      } catch (err: any) {
        console.error("Failed to load students", err);
        toast.error(err?.message || "Không thể tải danh sách học sinh.");
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, classId]);

  const handleExport = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (!onExport) return;
    try {
      setExporting(true);
      await onExport();
      toast.success("Class exported successfully.");
    } catch (err: any) {
      console.error("Export failed", err);
      toast.error(err?.message || "Failed to export class.");
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[11000] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* overlay */}
        <motion.button
          aria-label="close"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0 bg-black/55"
        />

        {/* modal content */}
        <motion.div
          initial={{ y: 12, opacity: 0, scale: 0.995 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.995 }}
          transition={{ duration: 0.18 }}
          className="relative w-[95vw] max-w-4xl mx-4 rounded-lg shadow-xl p-4 overflow-auto bg-white text-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Students in {classNameLabel}
            </h3>
            <div className="flex items-center gap-2">
              {canExport && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                  disabled={exporting}
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exporting..." : "Export"}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1 rounded border bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>

          {/* body */}
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No students enrolled in this class.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-3 text-sm text-gray-600">Total: {students.length}</div>
              <div className="rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                <table className="w-full table-auto text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left border-b border-gray-200">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Full name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Date of birth</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr
                        key={s.student_user_id}
                        className="border-b last:border-b-0 border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 align-top">{idx + 1}</td>
                        <td className="px-3 py-2 align-top">{s.student_user_id}</td>
                        <td className="px-3 py-2 align-top">{s.full_name ?? "—"}</td>
                        <td className="px-3 py-2 align-top">{s.email ?? "—"}</td>
                        <td className="px-3 py-2 align-top">{s.date_of_birth ?? "—"}</td>
                        <td className="px-3 py-2 align-top">{s.phone_number ?? "—"}</td>
                        <td className="px-3 py-2 align-top">{s.gender ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

const StudentsModal = React.memo(StudentsModalInner);
