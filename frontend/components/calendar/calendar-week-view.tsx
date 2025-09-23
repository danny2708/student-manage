"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { BaseCard } from "../ui/base-card";
import { BaseButton } from "../ui/base-button";
import { cn } from "../../src/lib/utils";

interface ScheduleItem {
  id?: string;
  date?: string; // yyyy-mm-dd
  start?: string;
  end?: string;
  title?: string;
  room?: string;
  subject?: string;
  students?: number;
  color?: string;
}

interface CalendarWeekViewProps {
  schedules: ScheduleItem[];
  onEventClick?: (event: ScheduleItem) => void;
  weekStart?: string; // yyyy-mm-dd (optional parent-driven week start)
  onDayClick?: (dateYmd: string) => void; // called when user clicks a header day
}

/* ----- helpers ----- */
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseYMD = (s?: string) => {
  if (!s) return null;
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
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(d, diffToMonday);
};

const normTime = (t?: string) => {
  if (!t) return undefined;
  const parts = t.split(":");
  if (parts.length >= 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  return t;
};

/* ----- component ----- */
export function CalendarWeekView({ schedules, onEventClick, weekStart, onDayClick }: CalendarWeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(() => getStartOfWeek(new Date()));

  // if parent provides weekStart, sync to that week
  useEffect(() => {
    if (weekStart) {
      const parsed = parseYMD(weekStart);
      if (parsed) setCurrentWeek(getStartOfWeek(parsed));
    }
  }, [weekStart]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((cw) => addDays(cw, direction === "next" ? 7 : -7));
  };

  // normalize schedule.date to yyyy-mm-dd for comparisons
  const getScheduleDateYmd = (s: ScheduleItem) => {
    if (!s.date) return undefined;
    const parsed = parseYMD(s.date);
    return parsed ? toYMD(parsed) : undefined;
  };

  const getEventsForDate = (date: Date) => {
    const ymd = toYMD(date);
    // schedules should already be occurrences with explicit date; match by normalized ymd
    return schedules.filter((sch) => getScheduleDateYmd(sch) === ymd);
  };

  const getEventTopHeight = (startTime?: string, endTime?: string) => {
    const start = (startTime ?? "09:00").split(":").map(Number);
    const end = (endTime ?? "10:00").split(":").map(Number);
    const startMinutes = start[0] * 60 + (start[1] ?? 0);
    const endMinutes = end[0] * 60 + (end[1] ?? 0);
    const topPx = ((startMinutes - 6 * 60) / 60) * 60; // 60px per hour, starting 06:00
    const heightPx = ((endMinutes - startMinutes) / 60) * 60;
    return { topPx, heightPx };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Week View</h2>
          <p className="text-muted-foreground">
            {weekDays[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} -{" "}
            {weekDays[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BaseButton variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={() => setCurrentWeek(getStartOfWeek(new Date()))}>
            Today
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </BaseButton>
        </div>
      </div>

      <BaseCard variant="glass" className="overflow-hidden">
        <div className="grid grid-cols-8 border-b border-border/50">
          <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
          {weekDays.map((day, index) => {
            const ymd = toYMD(day);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={index} className="p-4 text-center border-l border-border/50">
                <button
                  onClick={() => onDayClick?.(ymd)}
                  className="w-full focus:outline-none"
                  aria-label={`Open day ${ymd}`}
                >
                  <div className="text-sm font-medium text-muted-foreground">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div
                    className={cn(
                      "text-lg font-semibold mt-1",
                      isToday ? "text-primary" : "text-foreground"
                    )}
                  >
                    {day.getDate()}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="relative">
          <div className="grid grid-cols-8 min-h-[600px]">
            {/* Time column */}
            <div className="border-r border-border/50">
              {timeSlots
                .filter((_, i) => i >= 6 && i <= 22)
                .map((time) => (
                  <div key={time} className="h-[60px] p-2 text-xs text-muted-foreground border-b border-border/20">
                    {time}
                  </div>
                ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="relative border-r border-border/50">
                {/* Time grid lines */}
                {timeSlots
                  .filter((_, i) => i >= 6 && i <= 22)
                  .map((time) => (
                    <div key={time} className="h-[60px] border-b border-border/20" />
                  ))}

                {/* Events */}
                <div className="absolute inset-0 p-1">
                  {getEventsForDate(day).map((event, eventIndex) => {
                    const { topPx, heightPx } = getEventTopHeight(event.start, event.end);
                    const colors = [
                      "from-blue-500 to-blue-600",
                      "from-purple-500 to-purple-600",
                      "from-green-500 to-green-600",
                      "from-orange-500 to-orange-600",
                      "from-pink-500 to-pink-600",
                    ];
                    const colorClass = colors[eventIndex % colors.length];

                    return (
                      <div
                        key={`${dayIndex}-${eventIndex}-${event.id}`}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                          `bg-gradient-to-br ${colorClass} text-white`
                        )}
                        style={{
                          top: `${Math.max(0, topPx) + 8}px`,
                          height: `${Math.max(24, heightPx - 4)}px`,
                        }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="text-xs font-semibold truncate">{event.title}</div>
                        <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {event.start} - {event.end}
                        </div>
                        {event.room && (
                          <div className="text-xs opacity-90 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.room}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BaseCard>
    </div>
  );
}
