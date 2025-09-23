"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, List, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BaseModal } from "../../../components/ui/base-modal";
import { BaseButton } from "../../../components/ui/base-button";
import { CalendarWeekView } from "../../../components/calendar/calendar-week-view";
import { CalendarDayView } from "../../../components/calendar/calendar-day-view";
import { CalendarListView } from "../../../components/calendar/calendar-list-view";
import { useSchedules } from "../../../src/hooks/useSchedule";

interface ScheduleItem {
  id?: string;
  date?: string; // yyyy-mm-dd or dd/mm/yyyy from API
  start?: string; // HH:MM or HH:MM:SS
  end?: string;
  title?: string;
  room?: string;
  subject?: string;
  students?: number;
  originalScheduleId?: number | string;
}

interface PersonalScheduleModalProps {
  open: boolean;
  onClose: () => void;
  fetchSchedule?: () => Promise<any[] | null>;
}

type ViewType = "week" | "day" | "list";

/* ---------- Helpers ---------- */
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseYMD = (s?: string) => {
  if (!s) return null;
  // Accept yyyy-mm-dd or dd/mm/yyyy
  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length >= 3) {
      const [dd, mm, yy] = parts;
      const y = yy.length === 2 ? `20${yy}` : yy;
      return new Date(Number(y), Number(mm) - 1, Number(dd));
    }
    return null;
  }
  const parts = s.split("-");
  if (parts.length >= 3) {
    const [y, m, d] = parts;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return null;
};

const addDays = (d: Date, days: number) => {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
};

const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(d, diffToMonday);
};

const weekdayToIndex = (raw?: any): number | null => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") {
    if (raw >= 1 && raw <= 7) return raw === 7 ? 0 : raw;
    if (raw >= 0 && raw <= 6) return raw;
    return null;
  }
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (/^su(n(day)?)?/.test(s)) return 0;
  if (/^mo(n(day)?)?/.test(s)) return 1;
  if (/^tu(e(day)?)?/.test(s)) return 2;
  if (/^we(d(nesday)?)?/.test(s)) return 3;
  if (/^th(u|ursday)?/.test(s)) return 4;
  if (/^fr(i(day)?)?/.test(s)) return 5;
  if (/^sa(t(urday)?)?/.test(s)) return 6;
  const num = Number(s);
  if (!Number.isNaN(num)) return weekdayToIndex(num);
  return null;
};

const normTime = (t?: string) => {
  if (!t) return undefined;
  const parts = t.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return t;
};

/* ---------- Component ---------- */

export default function PersonalScheduleModal({ open, onClose, fetchSchedule }: PersonalScheduleModalProps) {
  const { schedules, loading, error, fetchSchedules } = useSchedules();
  const [currentView, setCurrentView] = useState<ViewType>("week");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);

  // week navigation: 0 = this week, +/-1 previous/next weeks
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const referenceDate = useMemo(() => addDays(new Date(), weekOffset * 7), [weekOffset]);
  const startOfWeek = useMemo(() => getStartOfWeek(referenceDate), [referenceDate]);
  const weekDates = useMemo(() => Array.from({ length: 7 }).map((_, i) => toYMD(addDays(startOfWeek, i))), [startOfWeek]);

  useEffect(() => {
    if (open) {
      if (fetchSchedules) fetchSchedules().catch(() => {});
      else if (fetchSchedule) fetchSchedule().catch(() => {});
    }
  }, [open, fetchSchedules, fetchSchedule]);

  const occurrences = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];

    const result: ScheduleItem[] = [];
    const seen = new Set<string>();

    // list range relative to reference date (startOfWeek) to cover future days from selected week
    const LIST_RANGE_DAYS = 28;
    const listRangeDates = Array.from({ length: LIST_RANGE_DAYS }).map((_, i) => toYMD(addDays(referenceDate, i)));

    // union dates to check (week dates + list range)
    const datesToCheckSet = new Set<string>([...weekDates, ...listRangeDates]);
    const datesToCheck = Array.from(datesToCheckSet).sort();

    for (const s of schedules as any[]) {
      const originalId = s.id ?? s.schedule_id ?? s.class_id ?? Math.random().toString();
      const idStr = String(originalId);
      const title = s.class_name ?? s.title ?? s.subject ?? "Class";
      const start_time = normTime(s.start_time ?? s.start ?? "09:00");
      const end_time = normTime(s.end_time ?? s.end ?? "10:30");
      const room = s.room ?? s.location ?? "TBA";
      const subject = s.subject ?? null;
      const students = s.students ?? null;

      const scheduleType = (s.schedule_type ?? (s.type ?? "WEEKLY")).toString().toUpperCase();
      const onceDateRaw = s.date ?? s.once_date ?? null; // could be dd/mm/yyyy or yyyy-mm-dd
      const dayOfWeekRaw = s.day_of_week ?? s.day ?? s.weekday ?? s.week ?? null;
      const dayIndex = weekdayToIndex(dayOfWeekRaw);

      for (const dateStr of datesToCheck) {
        let occurs = false;

        // ONCE: if onceDateRaw provided (accept dd/mm/yyyy too)
        if ((scheduleType === "ONCE" || onceDateRaw) && onceDateRaw) {
          // normalize onceDateRaw to yyyy-mm-dd
          let parsedDate = parseYMD(String(onceDateRaw));
          if (!parsedDate && typeof onceDateRaw === "number") {
            parsedDate = new Date(Number(onceDateRaw));
          }
          const onceStr = parsedDate ? toYMD(parsedDate) : null;
          if (onceStr === dateStr) occurs = true;
        }

        // WEEKLY: match weekday if not already occurred (ONCE precedence)
        if (!occurs && scheduleType === "WEEKLY") {
          if (dayIndex !== null) {
            const parsed = parseYMD(dateStr)!;
            if (parsed.getDay() === dayIndex) occurs = true;
          }
        }

        if (occurs) {
          const key = `${idStr}_${dateStr}`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push({
              id: `${idStr}_${dateStr}`,
              originalScheduleId: originalId,
              date: dateStr,
              start: start_time,
              end: end_time,
              title,
              room,
              subject,
              students,
            });
          }
        }
      }
    }

    // sort by date then time
    result.sort((a, b) => {
      if (a.date === b.date) return (a.start ?? "").localeCompare(b.start ?? "");
      return (a.date ?? "").localeCompare(b.date ?? "");
    });

    return result;
  }, [schedules, weekDates, referenceDate]);

  // day view default = first day of week (or today if current week)
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  useEffect(() => {
    // when weekOffset or open changes, reset selectedDay to referenceDate (today+offset) ymd
    const ref = toYMD(referenceDate);
    setSelectedDay(ref);
  }, [referenceDate, open]);

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your schedule...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-2">Error Loading Schedule</div>
            <p className="text-muted-foreground">{error}</p>
            <BaseButton className="mt-4" onClick={() => fetchSchedules?.()}>
              Try Again
            </BaseButton>
          </div>
        </div>
      );
    }

    if (currentView === "week") {
      // filter occurrences for current weekDates
      const weekEvents = occurrences.filter((o) => o.date && weekDates.includes(o.date));
      return (
        <CalendarWeekView
          schedules={weekEvents}
          onEventClick={(e) => setSelectedEvent(e as ScheduleItem)}
          weekStart={toYMD(startOfWeek)}
          onDayClick={(dateYmd) => {
            setSelectedDay(dateYmd);
            setCurrentView("day");
          }}
        />
      );
    }

    if (currentView === "day") {
      const day = selectedDay ?? toYMD(new Date());
      const dayEvents = occurrences.filter((o) => o.date === day);
      return <CalendarDayView schedules={dayEvents} onEventClick={(e) => setSelectedEvent(e as ScheduleItem)} date={day} />;
    }

    // list view: occurrences already cover the list range relative to reference
    const listEvents = [...occurrences];
    return <CalendarListView schedules={listEvents} onEventClick={(e) => setSelectedEvent(e as ScheduleItem)} />;
  };

  return (
    <>
      <BaseModal open={open} onClose={onClose} size="full" className="p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="text-2xl font-bold text-balance">Personal Schedule</h2>
              <p className="text-muted-foreground">
                Manage and view your teaching schedule
                {schedules && schedules.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{schedules.length} classes</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* week nav */}
              <div className="flex items-center gap-1 border rounded p-1 bg-muted/10">
                <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 rounded hover:bg-muted/20" title="Previous week">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="px-3 text-sm">Week of {toYMD(startOfWeek)}</div>
                <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded hover:bg-muted/20" title="Next week">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <BaseButton variant="ghost" size="sm" onClick={() => fetchSchedules?.()} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </BaseButton>

              <BaseButton variant={currentView === "week" ? "primary" : "outline"} size="sm" onClick={() => setCurrentView("week")}>
                <Calendar className="h-4 w-4 mr-2" />
                Week
              </BaseButton>
              <BaseButton variant={currentView === "day" ? "primary" : "outline"} size="sm" onClick={() => setCurrentView("day")}>
                <Clock className="h-4 w-4 mr-2" />
                Day
              </BaseButton>
              <BaseButton variant={currentView === "list" ? "primary" : "outline"} size="sm" onClick={() => setCurrentView("list")}>
                <List className="h-4 w-4 mr-2" />
                List
              </BaseButton>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView + weekOffset}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.18 }}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </BaseModal>

      {/* Event Detail Modal */}
      <BaseModal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Class Details" size="md">
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{selectedEvent.title}</h3>
              {selectedEvent.subject && <p className="text-muted-foreground">{selectedEvent.subject}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Time</label>
                <p className="text-lg">
                  {selectedEvent.start} - {selectedEvent.end}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-lg">{selectedEvent.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-lg">{selectedEvent.room}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Students</label>
                <p className="text-lg">{selectedEvent.students ?? "N/A"} enrolled</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <BaseButton className="flex-1">Edit Class</BaseButton>
              <BaseButton variant="outline" className="flex-1">
                View Students
              </BaseButton>
            </div>
          </div>
        )}
      </BaseModal>
    </>
  );
}
