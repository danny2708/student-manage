// File: components/DashboardContent.tsx
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"

export default function DashboardContent() {
  return (
    <>
      <style jsx>{`
        .stat-card-emerald {
          background: #10b981 !important;
          color: white !important;
        }
        .stat-card-orange {
          background: #f97316 !important;
          color: white !important;
        }
        .stat-card-cyan {
          background: #06b6d4 !important;
          color: white !important;
        }
        .stat-card-red {
          background: #ef4444 !important;
          color: white !important;
        }
        .stat-card-emerald *,
        .stat-card-orange *,
        .stat-card-cyan *,
        .stat-card-red * {
          color: white !important;
        }
      `}</style>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card-emerald rounded-lg shadow-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">Class</h3>
            </div>
            <div>
              <div className="text-3xl font-bold">4</div>
              <p className="text-xs opacity-80 mt-1">Active classes</p>
            </div>
          </div>

          <div className="stat-card-orange rounded-lg shadow-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">Teacher</h3>
            </div>
            <div>
              <div className="text-3xl font-bold">5</div>
              <p className="text-xs opacity-80 mt-1">Active teachers</p>
            </div>
          </div>

          <div className="stat-card-cyan rounded-lg shadow-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">Student</h3>
            </div>
            <div>
              <div className="text-3xl font-bold">4</div>
              <p className="text-xs opacity-80 mt-1">Enrolled students</p>
            </div>
          </div>

          <div className="stat-card-red rounded-lg shadow-lg p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium opacity-90">Schedule</h3>
            </div>
            <div>
              <div className="text-3xl font-bold">2</div>
              <p className="text-xs opacity-80 mt-1">Today's classes</p>
            </div>
          </div>
        </div>

        {/* Calendar Widget */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-emerald-700">
              <div className="text-lg font-semibold mb-2">February 2024</div>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="font-medium p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 28 }, (_, i) => (
                  <div key={i} className="p-2 hover:bg-emerald-200 rounded cursor-pointer">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}