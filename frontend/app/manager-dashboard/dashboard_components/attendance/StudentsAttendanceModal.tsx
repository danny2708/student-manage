"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAttendance } from "../../../../src/hooks/useAttendance";
import { getStudentsInClass, Student } from "../../../../src/services/api/class";
import { Attendance, AttendanceBatchCreate } from "../../../../src/services/api/attendance";
import toast from "react-hot-toast";

interface StudentsAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  modalData: null | { schedule: any; mode: "take" | "edit" };
  date: string;
  onSubmitted?: () => Promise<void> | void;
}

const StudentsAttendanceModalInner: React.FC<StudentsAttendanceModalProps> = ({ open, onClose, modalData, date, onSubmitted }) => {
  const { addBatchAttendance, editAttendance, fetchAttendancesBySchedule } = useAttendance();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const mountedRef = React.useRef(false);

  // local records map: student_user_id -> { status, checkin_time?, attendance_id? }
  const [recordsMap, setRecordsMap] = React.useState<Record<number, { status: string; checkin_time?: string | null; attendance_id?: number | null }>>({});

  React.useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const nowISOTime = () => new Date().toISOString(); // full ISO timestamp

  // load when open/modalData changes
  React.useEffect(() => {
    if (!open || !modalData) return;

    let cancelled = false;
    const load = async () => {
      setLoadingStudents(true);
      try {
        const schedule = modalData.schedule;
        // fetch students
        const studentsData = await getStudentsInClass(schedule.class_id ?? schedule.id ?? schedule.class_id);
        if (cancelled) return;
        setStudents(studentsData ?? []);

        // fetch attendances for schedule and date
        const attendancesResp = await fetchAttendancesBySchedule(schedule.id);
        // fetchAttendancesBySchedule uses hook's handleFetch and returns data or null
        const allForSchedule: Attendance[] = Array.isArray(attendancesResp) ? (attendancesResp as Attendance[]) : [];
        const forDate = allForSchedule.filter((a) => a.attendance_date === date);

        // build recordsMap initial
        const map: typeof recordsMap = {};
        // map existing attendances by student_user_id
        const byStudent = new Map<number, Attendance>();
        for (const a of forDate) byStudent.set(a.student_user_id, a);

        // for every student, prefill with existing or empty
        for (const s of studentsData ?? []) {
          const hv = byStudent.get(s.student_user_id);
          if (hv) {
            map[s.student_user_id] = {
              status: hv.status ?? "absent",
              checkin_time: hv.checkin_time ?? null,
              attendance_id: hv.attendance_id,
            };
          } else {
            map[s.student_user_id] = { status: "", checkin_time: null, attendance_id: null };
          }
        }
        if (!cancelled && mountedRef.current) setRecordsMap(map);
      } catch (err: any) {
        console.error("Load students/attendances failed", err);
        toast.error(err?.message || "Failed to load attendance data.");
      } finally {
        if (!cancelled && mountedRef.current) setLoadingStudents(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, modalData, date, fetchAttendancesBySchedule]);

  if (!open || !modalData) return null;

  const schedule = modalData.schedule;

  const setRecord = (student_user_id: number, patch: { status?: string; checkin_time?: string | null }) => {
    setRecordsMap((prev) => {
      const cur = prev[student_user_id] ?? { status: "", checkin_time: null, attendance_id: null };
      return { ...prev, [student_user_id]: { ...cur, ...patch } };
    });
  };

  const allMarked = React.useMemo(() => {
    // require each student to have status non-empty
    return students.length > 0 && students.every((s) => (recordsMap[s.student_user_id]?.status ?? "") !== "");
  }, [students, recordsMap]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const entries = Object.entries(recordsMap).map(([k, v]) => ({ student_user_id: Number(k), ...v }));
      const toUpdate = entries.filter((e) => e.attendance_id); // existing records
      const toCreate = entries.filter((e) => !e.attendance_id); // new records

      // 1) batch create new records if any
      if (toCreate.length > 0) {
        const payload: AttendanceBatchCreate = {
          schedule_id: schedule.id,
          attendance_date: date,
          records: toCreate.map((c) => ({
            student_user_id: c.student_user_id,
            status: c.status,
            checkin_time: c.checkin_time ?? (c.status === "present" ? nowISOTime() : null),
          })),
        };
        await addBatchAttendance(payload);
      }

      // 2) update existing individually
      for (const upd of toUpdate) {
        // editAttendance expects (id, payload)
        const attendanceId = upd.attendance_id as number;
        const payload = {
          student_user_id: upd.student_user_id,
          schedule_id: schedule.id,
          status: upd.status,
          checkin_time: upd.checkin_time ?? (upd.status === "present" ? nowISOTime() : null),
          attendance_date: date,
        };
        // call editAttendance with id and payload (hook will toast)
        // eslint-disable-next-line no-await-in-loop
        await editAttendance(attendanceId, payload);
      }

      toast.success("Attendance submitted.");
      // refresh parent attendances
      await fetchAttendancesBySchedule(schedule.id);
      if (onSubmitted) await onSubmitted();
      onClose();
    } catch (err: any) {
      console.error("Submit failed", err);
      toast.error(err?.message || "Submit attendance failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[12000] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* backdrop */}
        <motion.button
          aria-label="close"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        />

        <motion.div
          initial={{ y: 12, opacity: 0, scale: 0.995 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.995 }}
          transition={{ duration: 0.18 }}
          className="relative w-[95vw] max-w-4xl mx-4 rounded-lg shadow-xl p-4 overflow-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundColor: "#031220ff", color: "#fff" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attendance — {schedule.class_name}</h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-300">Date: {date}</div>
              <button onClick={onClose} className="px-3 py-1 rounded border border-gray-700 text-white">Close</button>
            </div>
          </div>

          {loadingStudents ? (
            <div className="text-white">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-white">No students enrolled.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="px-3 py-2 text-white">#</th>
                      <th className="px-3 py-2 text-white">ID</th>
                      <th className="px-3 py-2 text-white">Full name</th>
                      <th className="px-3 py-2 text-white">Email</th>
                      <th className="px-3 py-2 text-white">DOB</th>
                      <th className="px-3 py-2 text-white">Phone</th>
                      <th className="px-3 py-2 text-white">Gender</th>
                      <th className="px-3 py-2 text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => {
                      const rec = recordsMap[s.student_user_id] ?? { status: "", checkin_time: null, attendance_id: null };
                      return (
                        <tr key={s.student_user_id} className="border-b last:border-b-0 border-gray-700">
                          <td className="px-3 py-2 align-top text-white">{idx + 1}</td>
                          <td className="px-3 py-2 align-top text-white">{s.student_user_id}</td>
                          <td className="px-3 py-2 align-top text-white">{s.full_name ?? "—"}</td>
                          <td className="px-3 py-2 align-top text-white">{s.email ?? "—"}</td>
                          <td className="px-3 py-2 align-top text-white">{s.date_of_birth ?? "—"}</td>
                          <td className="px-3 py-2 align-top text-white">{s.phone_number ?? "—"}</td>
                          <td className="px-3 py-2 align-top text-white">{s.gender ?? "—"}</td>
                          <td className="px-3 py-2 align-top">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setRecord(s.student_user_id, { status: "present", checkin_time: nowISOTime() })}
                                className={`px-3 py-1 rounded ${rec.status === "present" ? "bg-green-600 text-white" : "bg-white/5 text-white"}`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => setRecord(s.student_user_id, { status: "absent", checkin_time: null })}
                                className={`px-3 py-1 rounded ${rec.status === "absent" ? "bg-red-600 text-white" : "bg-white/5 text-white"}`}
                              >
                                Absent
                              </button>
                              {rec.attendance_id && <div className="text-xs text-gray-300 ml-2">saved</div>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <div className="text-sm text-gray-300 mr-auto">Marked: {Object.values(recordsMap).filter(r => r.status).length}/{students.length}</div>
                <button
                  onClick={() => {
                    // mark all absent quickly
                    const newMap = { ...recordsMap };
                    for (const s of students) {
                      newMap[s.student_user_id] = { ...(newMap[s.student_user_id] ?? { attendance_id: null }), status: "absent", checkin_time: null };
                    }
                    setRecordsMap(newMap);
                  }}
                  className="px-3 py-1 bg-white/5 rounded text-white"
                >
                  Mark all absent
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!allMarked || submitting}
                  className={`px-4 py-2 rounded ${!allMarked || submitting ? "bg-gray-600 text-gray-300 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-600 text-white"}`}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

const StudentsAttendanceModal = React.memo(StudentsAttendanceModalInner);

export default StudentsAttendanceModal;