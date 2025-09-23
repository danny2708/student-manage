"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
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
}

interface CalendarWeekViewProps {
  schedules: ScheduleItem[]
  onEventClick?: (event: ScheduleItem) => void
}

export function CalendarWeekView({ schedules, onEventClick }: CalendarWeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays(currentWeek)
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`)

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const getEventsForDay = (date: Date) => {
    return schedules.filter((schedule) => {
      // For demo purposes, we'll show events on weekdays
      const dayOfWeek = date.getDay()
      return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday
    })
  }

  const getEventPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes

    return {
      top: `${(startMinutes / 60) * 60}px`, // 60px per hour
      height: `${(duration / 60) * 60}px`,
    }
  }

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
          <BaseButton variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
            Today
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </BaseButton>
        </div>
      </div>

      {/* Calendar Grid */}
      <BaseCard variant="glass" className="overflow-hidden">
        <div className="grid grid-cols-8 border-b border-border/50">
          <div className="p-4 text-sm font-medium text-muted-foreground">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 text-center border-l border-border/50">
              <div className="text-sm font-medium text-muted-foreground">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={cn(
                  "text-lg font-semibold mt-1",
                  day.toDateString() === new Date().toDateString() ? "text-primary" : "text-foreground",
                )}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="grid grid-cols-8 min-h-[600px]">
            {/* Time column */}
            <div className="border-r border-border/50">
              {timeSlots
                .filter((_, i) => i >= 6 && i <= 22)
                .map((time, index) => (
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
                  .map((time, timeIndex) => (
                    <div key={time} className="h-[60px] border-b border-border/20" />
                  ))}

                {/* Events */}
                <div className="absolute inset-0 p-1">
                  {getEventsForDay(day).map((event, eventIndex) => {
                    const position = getEventPosition(event.start || "09:00", event.end || "10:30")
                    const colors = [
                      "from-blue-500 to-blue-600",
                      "from-purple-500 to-purple-600",
                      "from-green-500 to-green-600",
                      "from-orange-500 to-orange-600",
                      "from-pink-500 to-pink-600",
                    ]
                    const colorClass = colors[eventIndex % colors.length]

                    return (
                      <div
                        key={`${dayIndex}-${eventIndex}`}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                          `bg-gradient-to-br ${colorClass} text-white`,
                        )}
                        style={{
                          top: `${(Number.parseInt(event.start?.split(":")[0] || "9") - 6) * 60 + 8}px`,
                          height: `${(Number.parseInt(event.end?.split(":")[0] || "10") - Number.parseInt(event.start?.split(":")[0] || "9")) * 60 - 4}px`,
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
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BaseCard>
    </div>
  )
}
