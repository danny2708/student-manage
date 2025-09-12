"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { X, Search, Filter, Plus } from "lucide-react"

interface Class {
  class_id: number
  name: string
  teacher: string
  subject: string
  capacity: number
  fee: number
}

interface ClassModalProps {
  classes: Class[]
  onClose: () => void
}

export function ClassModal({ classes, onClose }: ClassModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Class Management</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors" aria-label="Close modal">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Class Cards Grid */}
        <div className="p-6 overflow-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClasses.map((classItem) => (
              <Card
                key={classItem.class_id}
                className="bg-gradient-to-br from-orange-400 to-orange-500 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="text-lg font-bold">{classItem.name}</div>
                    <div className="text-sm opacity-90">Teacher: {classItem.teacher}</div>
                    <div className="text-sm opacity-90">Subject: {classItem.subject}</div>
                    <div className="text-sm opacity-90">Capacity: {classItem.capacity}</div>
                    <div className="text-sm font-semibold">Fee: {formatCurrency(classItem.fee)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Class Card */}
            <Card className="bg-gradient-to-br from-cyan-400 to-cyan-500 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[140px]">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">Add New Class</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { Class }