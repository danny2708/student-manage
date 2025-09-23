"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useClasses } from "../../../../src/contexts/ClassContext";
import { useAuth } from "../../../../src/hooks/useAuth";
import { ActionModal } from "../../showInfo/action_modal";
import { ShowInfoModal } from "../../showInfo/ShowInfoModal";
import { CreateClassForm } from "./CreateClassForm";
import { Class } from "../../../../src/services/api/class";
import { useConfirmDialog } from "../../../../src/hooks/useConfirmDialog";

export default function ClassManagement() {
  const { classes, loading, error, removeClass, fetchClasses, exportClassData } = useClasses();
  const { user } = useAuth(); // Lấy thông tin user
  const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState<Class | null>(null);
  const [showAction, setShowAction] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const [filterTeacher, setFilterTeacher] = React.useState("");
  const [filterSubject, setFilterSubject] = React.useState("");

  const teachers = Array.from(new Set(classes.map(c => c.teacher_name).filter(Boolean)));
  const subjects = Array.from(new Set(classes.map(c => c.subject_name).filter(Boolean)));

  const isManager = user?.roles.includes("manager");

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeacher = filterTeacher ? cls.teacher_name === filterTeacher : true;
    const matchesSubject = filterSubject ? cls.subject_name === filterSubject : true;
    return matchesSearch && matchesTeacher && matchesSubject;
  });

  const handleCardClick = (cls: Class) => {
    setSelectedClass(cls);
    if (isManager) {
      setShowAction(true);
    } else {
      setShowInfo(true);
    }
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

  const handleExport = async () => {
    if (!selectedClass) return;
    await exportClassData(selectedClass.class_id);
    setShowInfo(false);
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
            className="bg-gray-800 p-6 rounded-lg shadow-xl hover:bg-gray-700 transition-colors cursor-pointer space-y-4"
          >
            <p className="text-lg font-semibold text-white">{cls.class_name}</p>
            <p className="text-gray-400">
              Teacher: <span className="text-gray-300">{cls.teacher_name ?? "—"}</span>
            </p>
            <p className="text-gray-400">
              Subject: <span className="text-gray-300">{cls.subject_name ?? "—"}</span>
            </p>
            <p className="text-gray-400">
              Capacity: <span className="text-gray-300">{cls.capacity ?? "—"}</span>
            </p>
            <p className="text-gray-400">
              Fee: <span className="text-gray-300">{cls.fee?.toLocaleString() ?? "—"}</span>
            </p>
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
                      `Bạn có chắc chắn muốn xoá lớp ${selectedClass.class_name}?`,
                      handleDelete
                    )
                  : undefined
              }
              userRoles={user?.roles} // Truyền roles vào ActionModal
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
              userRoles={user?.roles} // Truyền roles vào ShowInfoModal
              extraActions={
                <button
                  onClick={handleExport}
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors ml-2"
                >
                  Xuất danh sách
                </button>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
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

      {isOpen && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        {/* Confim Dialog */}
      </div>}
    </div>
  );
}