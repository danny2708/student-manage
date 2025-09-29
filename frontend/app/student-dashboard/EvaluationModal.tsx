"use client"

import type React from "react"
import { useState } from "react"
import { X, Search, BookOpen, Star, TrendingUp, Award, AlertTriangle, Eye, Download } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

interface EvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: "student" | "parent" | "teacher" | "manager"
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onClose, userRole }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null)

  if (!isOpen) return null

  const evaluations = [
    {
      id: 1,
      subject: "Mathematics",
      teacher: "Ms. Johnson",
      student: "John Doe",
      type: "exam",
      grade: "A",
      score: 95,
      maxScore: 100,
      date: "2025-01-15",
      content: "Algebra and Geometry Final Exam",
      feedback: "Excellent understanding of algebraic concepts. Strong problem-solving skills demonstrated.",
      studyPoints: 10,
      disciplinePoints: 0,
    },
    {
      id: 2,
      subject: "Physics",
      teacher: "Mr. Smith",
      student: "John Doe",
      type: "assignment",
      grade: "B+",
      score: 87,
      maxScore: 100,
      date: "2025-01-14",
      content: "Lab Report: Motion and Forces",
      feedback: "Good experimental design and data analysis. Could improve on conclusion writing.",
      studyPoints: 8,
      disciplinePoints: 0,
    },
    {
      id: 3,
      subject: "Chemistry",
      teacher: "Dr. Brown",
      student: "John Doe",
      type: "quiz",
      grade: "A-",
      score: 92,
      maxScore: 100,
      date: "2025-01-13",
      content: "Chemical Bonding Quiz",
      feedback: "Strong grasp of ionic and covalent bonding concepts.",
      studyPoints: 9,
      disciplinePoints: 0,
    },
    {
      id: 4,
      subject: "English",
      teacher: "Mrs. Davis",
      student: "John Doe",
      type: "discipline",
      grade: null,
      score: null,
      maxScore: null,
      date: "2025-01-12",
      content: "Late submission of essay",
      feedback: "Student submitted essay 2 days late without prior notice.",
      studyPoints: 0,
      disciplinePoints: 3,
    },
  ]

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-gray-100 text-gray-800"
    if (grade.startsWith("A")) return "bg-green-100 text-green-800"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exam":
        return <BookOpen className="w-4 h-4" />
      case "assignment":
        return <Star className="w-4 h-4" />
      case "quiz":
        return <TrendingUp className="w-4 h-4" />
      case "discipline":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-purple-100 text-purple-800"
      case "assignment":
        return "bg-blue-100 text-blue-800"
      case "quiz":
        return "bg-green-100 text-green-800"
      case "discipline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === "all" || evaluation.subject === filterSubject
    const matchesType = filterType === "all" || evaluation.type === filterType

    return matchesSearch && matchesSubject && matchesType
  })

  const subjects = [...new Set(evaluations.map((e) => e.subject))]
  const types = [...new Set(evaluations.map((e) => e.type))]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Evaluation History</h2>
              <p className="text-blue-100 mt-1">
                {userRole === "student" && "View your academic evaluations and feedback"}
                {userRole === "parent" && "Monitor your children's academic progress"}
                {userRole === "teacher" && "Manage student evaluations and grades"}
                {userRole === "manager" && "Overview of all evaluations and performance metrics"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search evaluations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Evaluations List */}
          <div className="w-1/2 border-r border-gray-200 overflow-auto">
            <div className="p-4 space-y-3">
              {filteredEvaluations.map((evaluation) => (
                <Card
                  key={evaluation.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedEvaluation?.id === evaluation.id ? "ring-2 ring-blue-500 shadow-md" : ""
                  }`}
                  onClick={() => setSelectedEvaluation(evaluation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getTypeColor(evaluation.type)}`}>
                          {getTypeIcon(evaluation.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{evaluation.subject}</h3>
                          <p className="text-sm text-gray-600">{evaluation.teacher}</p>
                        </div>
                      </div>
                      {evaluation.grade && (
                        <Badge className={getGradeColor(evaluation.grade)}>{evaluation.grade}</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{evaluation.content}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{evaluation.date}</span>
                      <div className="flex items-center space-x-3">
                        {evaluation.score && (
                          <span className="font-medium">
                            {evaluation.score}/{evaluation.maxScore}
                          </span>
                        )}
                        {evaluation.studyPoints > 0 && (
                          <span className="text-green-600">+{evaluation.studyPoints} SP</span>
                        )}
                        {evaluation.disciplinePoints > 0 && (
                          <span className="text-red-600">+{evaluation.disciplinePoints} DP</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Evaluation Details */}
          <div className="w-1/2 overflow-auto">
            {selectedEvaluation ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(selectedEvaluation.type)}`}>
                        {getTypeIcon(selectedEvaluation.type)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedEvaluation.subject}</h2>
                        <p className="text-gray-600">{selectedEvaluation.content}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Score and Grade */}
                  {selectedEvaluation.grade && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">{selectedEvaluation.score}</div>
                          <div className="text-sm text-gray-600">out of {selectedEvaluation.maxScore}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">{selectedEvaluation.grade}</div>
                          <div className="text-sm text-gray-600">Grade</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Points */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Award className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">+{selectedEvaluation.studyPoints}</div>
                            <div className="text-sm text-gray-600">Study Points</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-red-600">+{selectedEvaluation.disciplinePoints}</div>
                            <div className="text-sm text-gray-600">Discipline Points</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Evaluation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Teacher:</span>
                          <p className="text-gray-900">{selectedEvaluation.teacher}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Date:</span>
                          <p className="text-gray-900">{selectedEvaluation.date}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Type:</span>
                          <p className="text-gray-900 capitalize">{selectedEvaluation.type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Student:</span>
                          <p className="text-gray-900">{selectedEvaluation.student}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600">Feedback:</span>
                        <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedEvaluation.feedback}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Evaluation</h3>
                  <p className="text-gray-600">Choose an evaluation from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluationModal
