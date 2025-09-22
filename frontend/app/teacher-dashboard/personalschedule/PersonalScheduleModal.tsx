"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ScheduleItem {
  start?: string;
  end?: string;
  title?: string;
  room?: string;
}

interface PersonalScheduleModalProps {
  open: boolean;
  onClose: () => void;
  fetchSchedule?: () => Promise<ScheduleItem[] | null>;
}

export default function PersonalScheduleModal({ open, onClose, fetchSchedule }: PersonalScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) return;
      setLoading(true);
      setError(null);
      try {
        if (fetchSchedule) {
          const data = await fetchSchedule();
          if (!mounted) return;
          setSchedule(Array.isArray(data) ? data : []);
        } else {
          // fallback sample
          setSchedule([
            { start: "08:00", end: "09:30", title: "Math - Grade 10", room: "A1" },
            { start: "10:00", end: "11:30", title: "Physics - Grade 11", room: "B2" },
            { start: "14:00", end: "15:00", title: "Office Hours", room: "Online" },
          ]);
        }
      } catch (err: any) {
        console.error("Failed to load schedule:", err);
        if (!mounted) return;
        setError("Failed to load schedule.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [open, fetchSchedule]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-slate-800 text-black dark:text-white rounded-lg p-6 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Personal Schedule</h2>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-3 py-1 bg-slate-200 rounded">Close</button>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : schedule.length === 0 ? (
                <div className="text-center text-gray-500">No schedule available.</div>
              ) : (
                <div className="space-y-3">
                  {schedule.map((s, i) => (
                    <div key={i} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="font-medium">{s.title}</div>
                      <div className="text-sm text-gray-500">{s.start} - {s.end} • {s.room}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
