"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import { Card } from "src/components/ui/card"
import { Button } from "src/components/ui/button"
import { BookOpen, Users, Calendar, Star } from "lucide-react"

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Classes</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Mathematics - Grade 10</p>
                  <p className="text-sm text-gray-600">Room 201</p>
                </div>
                <span className="text-sm text-gray-500">9:00 AM</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Physics - Grade 11</p>
                  <p className="text-sm text-gray-600">Room 305</p>
                </div>
                <span className="text-sm text-gray-500">11:00 AM</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Chemistry - Grade 12</p>
                  <p className="text-sm text-gray-600">Lab 102</p>
                </div>
                <span className="text-sm text-gray-500">2:00 PM</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              <div className="py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">John Smith</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">"Excellent teaching method!"</p>
              </div>
              <div className="py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Sarah Johnson</span>
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">"Very helpful and patient."</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
