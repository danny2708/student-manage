"use client"

import type React from "react"
import { useState } from "react"
import { Users, Calendar, FileText, Star, DollarSign, User, Bell, BookOpen, Clock, AlertTriangle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"

interface ParentDashboardProps {
  isOpen: boolean
  onClose: () => void
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState("overview")

  if (!isOpen) return null

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "children-evaluation", label: "Children's Evaluation", icon: Star },
    { id: "children-schedule", label: "Children's Schedule", icon: Calendar },
    { id: "report", label: "Report", icon: FileText },
  ]

  const statCards = [
    {
      title: "Children",
      value: "2",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Children's Classes",
      value: "12",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Children's Tuitions",
      value: "$2,450",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
  ]

  const children = [
    {
      id: 1,
      name: "Emma Johnson",
      grade: "Grade 10",
      avatar: "/placeholder.svg?height=40&width=40",
      gpa: "3.85",
      attendance: "95%",
      studyPoints: 87,
      disciplinePoints: 2,
      status: "excellent",
    },
    {
      id: 2,
      name: "Michael Johnson",
      grade: "Grade 8",
      avatar: "/placeholder.svg?height=40&width=40",
      gpa: "3.62",
      attendance: "92%",
      studyPoints: 78,
      disciplinePoints: 5,
      status: "good",
    },
  ]

  const recentActivities = [
    { child: "Emma", activity: "Math test completed", grade: "A", date: "2025-01-15", type: "evaluation" },
    { child: "Michael", activity: "Science project submitted", grade: "B+", date: "2025-01-14", type: "assignment" },
    { child: "Emma", activity: "Parent-teacher meeting scheduled", date: "2025-01-20", type: "meeting" },
    { child: "Michael", activity: "Late arrival noted", date: "2025-01-13", type: "discipline" },
  ]

  const upcomingEvents = [
    { child: "Emma", event: "Chemistry Lab", time: "09:00 - 10:30", date: "Today" },
    { child: "Michael", event: "Math Quiz", time: "11:00 - 11:45", date: "Tomorrow" },
    { child: "Emma", event: "Parent-Teacher Conference", time: "14:00 - 14:30", date: "Jan 20" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "needs-attention":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "evaluation":
        return <Star className="w-4 h-4 text-yellow-500" />
      case "assignment":
        return <BookOpen className="w-4 h-4 text-blue-500" />
      case "meeting":
        return <Calendar className="w-4 h-4 text-purple-500" />
      case "discipline":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Parent Portal</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Parent Account</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-purple-50 text-purple-600 border-l-4 border-purple-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome, Sarah!</h1>
                <p className="text-purple-100 mt-1">Monitor your children's academic progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {statCards.map((card, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                          </div>
                          <div className={`p-3 rounded-full ${card.bgColor}`}>
                            <card.icon className={`w-6 h-6 ${card.textColor}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Children Overview */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Children Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {children.map((child) => (
                        <div key={child.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={child.avatar || "/placeholder.svg"} alt={child.name} />
                                <AvatarFallback>
                                  {child.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{child.name}</h3>
                                <p className="text-sm text-gray-600">{child.grade}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(child.status)}>{child.status}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">{child.gpa}</p>
                              <p className="text-xs text-gray-600">GPA</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-2xl font-bold text-green-600">{child.attendance}</p>
                              <p className="text-xs text-gray-600">Attendance</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-2xl font-bold text-purple-600">{child.studyPoints}</p>
                              <p className="text-xs text-gray-600">Study Points</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-2xl font-bold text-red-600">{child.disciplinePoints}</p>
                              <p className="text-xs text-gray-600">Discipline</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity & Upcoming Events */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Recent Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.child}: {activity.activity}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {activity.grade && (
                                  <Badge variant="secondary" className="text-xs">
                                    {activity.grade}
                                  </Badge>
                                )}
                                <p className="text-xs text-gray-500">{activity.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingEvents.map((event, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{event.child}</p>
                              <p className="text-sm text-gray-600">{event.event}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{event.time}</p>
                              <p className="text-xs text-gray-500">{event.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Button className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                        <div className="text-center">
                          <Calendar className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-sm">View Schedules</span>
                        </div>
                      </Button>
                      <Button className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                        <div className="text-center">
                          <Star className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-sm">Check Grades</span>
                        </div>
                      </Button>
                      <Button className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                        <div className="text-center">
                          <FileText className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-sm">View Reports</span>
                        </div>
                      </Button>
                      <Button className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                        <div className="text-center">
                          <DollarSign className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-sm">Payment History</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection !== "overview" && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {sidebarItems.find((item) => item.id === activeSection)?.label}
                  </h3>
                  <p className="text-gray-600">This section is under development.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard
