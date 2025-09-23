"use client"

import { useEffect, useState } from "react"
import { Calendar, List, Clock } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { BaseModal } from "../../../components/ui/base-modal"
import { BaseButton } from "../../../components/ui/base-button"
import { CalendarWeekView } from "../../../components/calendar/calendar-week-view"
import { CalendarDayView } from "../../../components/calendar/calendar-day-view"
import { CalendarListView } from "../../../components/calendar/calendar-list-view"
import { useSchedules } from "../../../src/hooks/useSchedule"

interface ScheduleItem {
  id?: string
  start?: string
  end?: string
  title?: string
  room?: string
  subject?: string
  students?: number
}

interface PersonalScheduleModalProps {
  open: boolean
  onClose: () => void
  fetchSchedule?: () => Promise<ScheduleItem[] | null>
}

type ViewType = "week" | "day" | "list"

export default function PersonalScheduleModal({ open, onClose, fetchSchedule }: PersonalScheduleModalProps) {
  const { schedules, loading, error, fetchSchedules } = useSchedules()
  const [currentView, setCurrentView] = useState<ViewType>("week")
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null)

  const transformedSchedules: ScheduleItem[] = schedules.map((schedule) => ({
    id: schedule.id?.toString(),
    start: schedule.start_time || "09:00",
    end: schedule.end_time || "10:30",
    title: schedule.class_name || "Class",
    room: schedule.room || "TBA",
  }))

  useEffect(() => {
    if (open) {
      if (fetchSchedules) {
        fetchSchedules()
      } else if (fetchSchedule) {
        fetchSchedule()
      }
    }
  }, [open, fetchSchedules, fetchSchedule])

  const handleEventClick = (event: ScheduleItem) => {
    setSelectedEvent(event)
  }

  const viewOptions = [
    { key: "week" as ViewType, label: "Week", icon: Calendar },
    { key: "day" as ViewType, label: "Day", icon: Clock },
    { key: "list" as ViewType, label: "List", icon: List },
  ]

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your schedule...</p>
          </div>
        </div>
      )
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
      )
    }

    const scheduleData =
      transformedSchedules.length > 0
        ? transformedSchedules
        : [
            {
              id: "1",
              start: "08:00",
              end: "09:30",
              title: "Advanced Mathematics",
              room: "Room A1",
              subject: "Mathematics",
              students: 25,
            },
            {
              id: "2",
              start: "10:00",
              end: "11:30",
              title: "Physics Laboratory",
              room: "Lab B2",
              subject: "Physics",
              students: 20,
            },
            {
              id: "3",
              start: "14:00",
              end: "15:00",
              title: "Office Hours",
              room: "Office 301",
              subject: "Consultation",
              students: 5,
            },
            {
              id: "4",
              start: "15:30",
              end: "17:00",
              title: "Chemistry Basics",
              room: "Lab C1",
              subject: "Chemistry",
              students: 30,
            },
          ]

    switch (currentView) {
      case "week":
        return <CalendarWeekView schedules={scheduleData} onEventClick={handleEventClick} />
      case "day":
        return <CalendarDayView schedules={scheduleData} onEventClick={handleEventClick} />
      case "list":
        return <CalendarListView schedules={scheduleData} onEventClick={handleEventClick} />
      default:
        return <CalendarWeekView schedules={scheduleData} onEventClick={handleEventClick} />
    }
  }

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
                {transformedSchedules.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {transformedSchedules.length} classes
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <BaseButton variant="ghost" size="sm" onClick={() => fetchSchedules?.()} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </BaseButton>

              {viewOptions.map(({ key, label, icon: Icon }) => (
                <BaseButton
                  key={key}
                  variant={currentView === key ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView(key)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </BaseButton>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
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
              <p className="text-muted-foreground">{selectedEvent.subject}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Time</label>
                <p className="text-lg">
                  {selectedEvent.start} - {selectedEvent.end}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-lg">{selectedEvent.room}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Students</label>
                <p className="text-lg">{selectedEvent.students} enrolled</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-lg">
                  {selectedEvent.start && selectedEvent.end
                    ? `${Number.parseInt(selectedEvent.end.split(":")[0]) - Number.parseInt(selectedEvent.start.split(":")[0])}h ${
                        Number.parseInt(selectedEvent.end.split(":")[1]) -
                          Number.parseInt(selectedEvent.start.split(":")[1]) || 30
                      }m`
                    : "N/A"}
                </p>
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
  )
}
