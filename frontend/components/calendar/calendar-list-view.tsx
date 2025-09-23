"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Users, Filter, Search } from "lucide-react"
import { BaseCard } from "../ui/base-card"
import { BaseButton } from "../ui/base-button"
import { cn } from "../../src/lib/utils"

interface ScheduleItem {
  id?: string
  start?: string
  end?: string
  title?: string
  room?: string
  subject?: string
  students?: number
  color?: string
  date?: string
}

interface CalendarListViewProps {
  schedules: ScheduleItem[]
  onEventClick?: (event: ScheduleItem) => void
}

export function CalendarListView({ schedules, onEventClick }: CalendarListViewProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState<string>("all")

  // Generate sample data for the list view
  const generateScheduleData = () => {
    const data = []
    const today = new Date()
    const daysToShow = viewMode === "week" ? 7 : 30

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip weekends for demo
      if (date.getDay() === 0 || date.getDay() === 6) continue

      schedules.forEach((schedule, index) => {
        data.push({
          ...schedule,
          id: `${i}-${index}`,
          date: date.toISOString().split("T")[0],
          dateObj: date,
        })
      })
    }
    return data
  }

  const allSchedules = generateScheduleData()
  const subjects = [...new Set(allSchedules.map((s) => s.subject).filter(Boolean))]

  const filteredSchedules = allSchedules.filter((schedule) => {
    const matchesSearch =
      !searchTerm ||
      schedule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.room?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = filterSubject === "all" || schedule.subject === filterSubject

    return matchesSearch && matchesSubject
  })

  const groupedSchedules = filteredSchedules.reduce(
    (groups, schedule) => {
      const date = schedule.date!
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(schedule)
      return groups
    },
    {} as Record<string, typeof filteredSchedules>,
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">List View</h2>
          <p className="text-muted-foreground">
            {viewMode === "week" ? "This week's" : "This month's"} schedule overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <BaseButton
            variant={viewMode === "week" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            Week
          </BaseButton>
          <BaseButton
            variant={viewMode === "month" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Month
          </BaseButton>
        </div>
      </div>

      {/* Filters */}
      <BaseCard variant="glass" className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search classes, subjects, or rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </BaseCard>

      {/* Schedule List */}
      <div className="space-y-6">
        {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">
                {daySchedules.length} {daySchedules.length === 1 ? "class" : "classes"}
              </span>
            </div>

            <div className="grid gap-3">
              {daySchedules
                .sort((a, b) => (a.start || "").localeCompare(b.start || ""))
                .map((schedule, index) => {
                  const colors = [
                    "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
                    "border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20",
                    "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
                    "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20",
                    "border-l-pink-500 bg-pink-50/50 dark:bg-pink-950/20",
                  ]
                  const colorClass = colors[index % colors.length]

                  return (
                    <BaseCard
                      key={schedule.id}
                      className={cn(
                        "p-4 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                        colorClass,
                      )}
                      onClick={() => onEventClick?.(schedule)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{schedule.title}</h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {schedule.start} - {schedule.end}
                              </span>
                            </div>

                            {schedule.room && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{schedule.room}</span>
                              </div>
                            )}

                            {schedule.students && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{schedule.students} students</span>
                              </div>
                            )}
                          </div>

                          {schedule.subject && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {schedule.subject}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                        </div>
                      </div>
                    </BaseCard>
                  )
                })}
            </div>
          </div>
        ))}

        {Object.keys(groupedSchedules).length === 0 && (
          <BaseCard className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No classes found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterSubject !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No classes scheduled for this period."}
            </p>
          </BaseCard>
        )}
      </div>
    </div>
  )
}
