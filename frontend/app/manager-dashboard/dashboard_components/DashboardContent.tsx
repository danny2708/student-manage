// File: components/DashboardContent.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useState, useEffect } from "react";

export default function DashboardContent() {
  const [stats, setStats] = useState({
    total_classes: 0,
    total_teachers: 0,
    total_students: 0,
    total_schedules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/managers/stats");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setStats(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calendar logic
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Điều chỉnh để Thứ Hai là 0, Thứ Ba là 1, ...
  const startDayIndex = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-600">Error fetching stats: {error}</p>
      </div>
    );
  }
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
        {/* Card 1: Class */}
        <div className="stat-card-emerald rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="pb-2">
            <h3 className="text-sm font-medium opacity-90">Class</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.total_classes}</div>
            <p className="text-xs opacity-80 mt-1">Active classes</p>
          </div>
        </div>

        {/* Card 2: Teacher */}
        <div className="stat-card-orange rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="pb-2">
            <h3 className="text-sm font-medium opacity-90">Teacher</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.total_teachers}</div>
            <p className="text-xs opacity-80 mt-1">Active teachers</p>
          </div>
        </div>

        {/* Card 3: Student */}
        <div className="stat-card-cyan rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="pb-2">
            <h3 className="text-sm font-medium opacity-90">Student</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.total_students}</div>
            <p className="text-xs opacity-80 mt-1">Enrolled students</p>
          </div>
        </div>

        {/* Card 4: Schedule */}
        <div className="stat-card-red rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <div className="pb-2">
            <h3 className="text-sm font-medium opacity-90">Schedule</h3>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.total_schedules}</div>
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
              <div className="text-lg font-semibold mb-2">{monthName} {currentYear}</div>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {daysOfWeek.map((day) => (
                  <div key={day} className="font-medium p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: startDayIndex }, (_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded cursor-pointer ${
                      i + 1 === currentDay 
                        ? 'bg-emerald-500 text-white font-bold' 
                        : 'hover:bg-emerald-200'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}