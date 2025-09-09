"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "../../../components/ui/input"

interface ModifyModalProps {
  type: string
  data: any
  onClose: () => void
  onSave: (updatedData: any) => void
}

export function ModifyModal({ type, data, onClose, onSave }: ModifyModalProps) {
  const [formData, setFormData] = useState(data)

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const renderFields = () => {
    switch (type) {
      case "user":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Username:</label>
              <Input
                type="text"
                value={formData.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Full Name:</label>
              <Input
                type="text"
                value={formData.fullName || ""}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Email:</label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Role:</label>
              <select
                aria-label="User Role" // ⬅️ Thêm aria-label
                value={formData.role || ""}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">No role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </>
        )
      case "tuition":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Student Name:</label>
              <Input
                type="text"
                value={formData.studentName || ""}
                onChange={(e) => handleInputChange("studentName", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Class:</label>
              <Input
                type="text"
                value={formData.class || ""}
                onChange={(e) => handleInputChange("class", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Amount:</label>
              <Input
                type="text"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Status:</label>
              <select
                aria-label="Tuition Status" // ⬅️ Thêm aria-label
                value={formData.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Due Date:</label>
              <Input
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </>
        )
      case "payroll":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Teacher Name:</label>
              <Input
                type="text"
                value={formData.teacherName || ""}
                onChange={(e) => handleInputChange("teacherName", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Base Salary:</label>
              <Input
                type="text"
                value={formData.baseSalary || ""}
                onChange={(e) => handleInputChange("baseSalary", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Bonus:</label>
              <Input
                type="text"
                value={formData.bonus || ""}
                onChange={(e) => handleInputChange("bonus", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Status:</label>
              <select
                aria-label="Payroll Status" // ⬅️ Thêm aria-label
                value={formData.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </>
        )
      case "schedule":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Class:</label>
              <Input
                type="text"
                value={formData.class || ""}
                onChange={(e) => handleInputChange("class", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Day:</label>
              <select
                aria-label="Schedule Day" // ⬅️ Thêm aria-label
                value={formData.day || ""}
                onChange={(e) => handleInputChange("day", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Room:</label>
              <Input
                type="text"
                value={formData.room || ""}
                onChange={(e) => handleInputChange("room", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Type:</label>
              <select
                aria-label="Schedule Type" // ⬅️ Thêm aria-label
                value={formData.type || ""}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="Weekly">Weekly</option>
                <option value="Once">Once</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Start Time:</label>
              <Input
                type="time"
                value={formData.start || ""}
                onChange={(e) => handleInputChange("start", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">End Time:</label>
              <Input
                type="time"
                value={formData.end || ""}
                onChange={(e) => handleInputChange("end", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </>
        )
      case "subject":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Subject Name:</label>
              <Input
                type="text"
                value={formData.subject || ""}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Classes:</label>
              <Input
                type="number"
                value={formData.classes || ""}
                onChange={(e) => handleInputChange("classes", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </>
        )
      case "class":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Class Name:</label>
              <Input
                type="text"
                value={formData.className || formData.class || ""}
                onChange={(e) => handleInputChange("className", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Teacher:</label>
              <Input
                type="text"
                value={formData.teacher || ""}
                onChange={(e) => handleInputChange("teacher", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Subject:</label>
              <Input
                type="text"
                value={formData.subject || ""}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Capacity:</label>
              <Input
                type="number"
                value={formData.capacity || ""}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyan-600">Fee:</label>
              <Input
                type="text"
                value={formData.fee || ""}
                onChange={(e) => handleInputChange("fee", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Modify {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700 text-xl font-bold" aria-label="Close modal">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {renderFields()}

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Save changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}