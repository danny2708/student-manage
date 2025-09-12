"use client"

import type React from "react"
import { useAuth } from "../../src/contexts/AuthContext"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Users, Calendar, Award, Bell } from "lucide-react"

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-white-600 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Children</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average GPA</p>
                <p className="text-2xl font-bold text-gray-900">3.7</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Children's Progress</h3>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Emma Johnson</h4>
                  <span className="text-sm text-gray-500">Grade 10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GPA: 3.9</span>
                  <span className="text-sm text-green-600">Attendance: 98%</span>
                </div>
              </div>
              <div className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Michael Johnson</h4>
                  <span className="text-sm text-gray-500">Grade 8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GPA: 3.5</span>
                  <span className="text-sm text-yellow-600">Attendance: 92%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              <div className="py-2 border-b">
                <p className="text-sm font-medium">Parent-Teacher Conference</p>
                <p className="text-xs text-gray-600">Scheduled for Emma - Math class</p>
                <p className="text-xs text-gray-400">2 days ago</p>
              </div>
              <div className="py-2 border-b">
                <p className="text-sm font-medium">Assignment Due</p>
                <p className="text-xs text-gray-600">Michael's Science project due tomorrow</p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>
              <div className="py-2">
                <p className="text-sm font-medium">Grade Update</p>
                <p className="text-xs text-gray-600">Emma received A+ in Mathematics</p>
                <p className="text-xs text-gray-400">3 days ago</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard
