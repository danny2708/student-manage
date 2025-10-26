"use client"

import type React from "react"
import { useState } from "react"
import {
  X,
  Download,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  Star,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: "student" | "parent" | "teacher" | "manager"
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, userRole }) => {
  const [selectedReport, setSelectedReport] = useState("academic-performance")
  const [dateRange, setDateRange] = useState("semester")

  if (!isOpen) return null

  const getReportTypes = () => {
    switch (userRole) {
      case "student":
        return [
          { id: "academic-performance", label: "Academic Performance", icon: TrendingUp },
          { id: "attendance", label: "Attendance Report", icon: Calendar },
          { id: "study-points", label: "Study Points History", icon: Award },
          { id: "discipline", label: "Discipline Record", icon: AlertTriangle },
        ]
      case "parent":
        return [
          { id: "children-overview", label: "Children's Overview", icon: Users },
          { id: "academic-progress", label: "Academic Progress", icon: TrendingUp },
          { id: "attendance-summary", label: "Attendance Summary", icon: Calendar },
          { id: "financial-summary", label: "Financial Summary", icon: BarChart3 },
        ]
      case "teacher":
        return [
          { id: "class-performance", label: "Class Performance", icon: BarChart3 },
          { id: "student-evaluations", label: "Student Evaluations", icon: Star },
          { id: "attendance-tracking", label: "Attendance Tracking", icon: Calendar },
          { id: "grade-distribution", label: "Grade Distribution", icon: PieChart },
        ]
      case "manager":
        return [
          { id: "school-overview", label: "School Overview", icon: BarChart3 },
          { id: "teacher-performance", label: "Teacher Performance", icon: Users },
          { id: "financial-report", label: "Financial Report", icon: LineChart },
          { id: "enrollment-stats", label: "Enrollment Statistics", icon: TrendingUp },
        ]
      default:
        return []
    }
  }

  const reportTypes = getReportTypes()

  const renderStudentReport = () => {
    switch (selectedReport) {
      case "academic-performance":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">3.85</div>
                  <div className="text-sm text-gray-600">Overall GPA</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">87</div>
                  <div className="text-sm text-gray-600">Study Points</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { subject: "Mathematics", grade: "A", gpa: 4.0, trend: "up" },
                    { subject: "Physics", grade: "B+", gpa: 3.7, trend: "stable" },
                    { subject: "Chemistry", grade: "A-", gpa: 3.8, trend: "up" },
                    { subject: "English", grade: "B", gpa: 3.3, trend: "down" },
                  ].map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{subject.subject}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge
                          className={
                            subject.grade.startsWith("A") ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {subject.grade}
                        </Badge>
                        <span className="text-sm text-gray-600">{subject.gpa}</span>
                        <TrendingUp
                          className={`w-4 h-4 ${subject.trend === "up" ? "text-green-500" : subject.trend === "down" ? "text-red-500" : "text-gray-400"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Coming Soon</h3>
              <p className="text-gray-600">This report is under development.</p>
            </div>
          </div>
        )
    }
  }

  const renderParentReport = () => {
    switch (selectedReport) {
      case "children-overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-gray-600">Children</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-600">Total Classes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">$2,450</div>
                  <div className="text-sm text-gray-600">Monthly Tuition</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { name: "Emma Johnson", grade: "Grade 10", gpa: "3.85", attendance: "95%", status: "excellent" },
                { name: "Michael Johnson", grade: "Grade 8", gpa: "3.62", attendance: "92%", status: "good" },
              ].map((child, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{child.name}</span>
                      <Badge
                        className={
                          child.status === "excellent" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }
                      >
                        {child.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{child.gpa}</div>
                        <div className="text-xs text-gray-600">GPA</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{child.attendance}</div>
                        <div className="text-xs text-gray-600">Attendance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Coming Soon</h3>
              <p className="text-gray-600">This report is under development.</p>
            </div>
          </div>
        )
    }
  }

  const renderTeacherReport = () => {
    switch (selectedReport) {
      case "class-performance":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">3.42</div>
                  <div className="text-sm text-gray-600">Average GPA</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">89%</div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">92%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Class Performance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { class: "Mathematics 101", students: 28, avgGrade: "B+", passRate: "92%" },
                    { class: "Physics 201", students: 24, avgGrade: "B", passRate: "87%" },
                    { class: "Chemistry 101", students: 32, avgGrade: "A-", passRate: "94%" },
                  ].map((classData, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{classData.class}</div>
                        <div className="text-sm text-gray-600">{classData.students} students</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-medium">{classData.avgGrade}</div>
                          <div className="text-xs text-gray-600">Avg Grade</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">{classData.passRate}</div>
                          <div className="text-xs text-gray-600">Pass Rate</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Coming Soon</h3>
              <p className="text-gray-600">This report is under development.</p>
            </div>
          </div>
        )
    }
  }

  const renderManagerReport = () => {
    switch (selectedReport) {
      case "school-overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-gray-600">Teachers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">156</div>
                  <div className="text-sm text-gray-600">Classes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">94%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { dept: "Mathematics", students: 312, avgGPA: 3.45, satisfaction: "92%" },
                      { dept: "Science", students: 289, avgGPA: 3.38, satisfaction: "89%" },
                      { dept: "English", students: 267, avgGPA: 3.52, satisfaction: "94%" },
                      { dept: "History", students: 198, avgGPA: 3.41, satisfaction: "91%" },
                    ].map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{dept.dept}</div>
                          <div className="text-sm text-gray-600">{dept.students} students</div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{dept.avgGPA}</div>
                            <div className="text-xs text-gray-600">Avg GPA</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">{dept.satisfaction}</div>
                            <div className="text-xs text-gray-600">Satisfaction</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-800">New Enrollments</div>
                        <div className="text-sm text-green-600">+12% from last month</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">47</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-800">Average Attendance</div>
                        <div className="text-sm text-blue-600">+2% from last month</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">91%</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium text-purple-800">Teacher Retention</div>
                        <div className="text-sm text-purple-600">Stable</div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">96%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Coming Soon</h3>
              <p className="text-gray-600">This report is under development.</p>
            </div>
          </div>
        )
    }
  }

  const renderReportContent = () => {
    switch (userRole) {
      case "student":
        return renderStudentReport()
      case "parent":
        return renderParentReport()
      case "teacher":
        return renderTeacherReport()
      case "manager":
        return renderManagerReport()
      default:
        return null
    }
  }

  const getRoleColor = () => {
    switch (userRole) {
      case "student":
        return "from-blue-600 to-purple-600"
      case "parent":
        return "from-purple-600 to-pink-600"
      case "teacher":
        return "from-green-600 to-blue-600"
      case "manager":
        return "from-orange-600 to-red-600"
      default:
        return "from-gray-600 to-gray-700"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Reports</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  selectedReport === report.id
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <report.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{report.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getRoleColor()} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {reportTypes.find((r) => r.id === selectedReport)?.label || "Report"}
                </h1>
                <p className="text-white/80 mt-1">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard -{" "}
                  {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)} Report
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">{renderReportContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default ReportModal
