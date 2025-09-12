"use client"

import type React from "react"

import { X } from "lucide-react"
import { useState } from "react"
import { Input } from "../../../components/ui/input"

interface CreateModalProps {
  type: string
  onClose: () => void
  onCreate: (data: any) => void
}

export function CreateModal({ type, onClose, onCreate }: CreateModalProps) {
  const [formData, setFormData] = useState<any>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
    onClose()
  }

  const renderForm = () => {
    switch (type) {
      case "payroll":
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Teacher id:</label>
                <Input
                  type="text"
                  value={formData.teacherId || ""}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Month:</label>
                <Input
                  type="text"
                  value={formData.month || ""}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Total base:</label>
                <Input
                  type="text"
                  value={formData.totalBase || ""}
                  onChange={(e) => setFormData({ ...formData, totalBase: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Reward bonus:</label>
                <Input
                  type="text"
                  value={formData.rewardBonus || ""}
                  onChange={(e) => setFormData({ ...formData, rewardBonus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        )
      case "tuition":
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Student:</label>
                <Input
                  type="text"
                  value={formData.student || ""}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Amount:</label>
                <Input
                  type="text"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Term:</label>
                <Input
                  type="text"
                  value={formData.term || ""}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Due date:</label>
                <Input
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        )
      case "class":
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Class name:</label>
                <Input
                  type="text"
                  value={formData.className || ""}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Teacher:</label>
                <Input
                  type="text"
                  value={formData.teacher || ""}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Subject:</label>
                <Input
                  type="text"
                  value={formData.subject || ""}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Fee:</label>
                <Input
                  type="text"
                  value={formData.fee || ""}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        )
      case "schedule":
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Class:</label>
                <Input
                  type="text"
                  value={formData.class || ""}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Room:</label>
                <Input
                  type="text"
                  value={formData.room || ""}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Schedule type:</label>
                <select
                  aria-label="Schedule type" 
                  value={formData.scheduleType || ""}
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Once">Once</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Date:</label>
                <Input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">Start time:</label>
                <Input
                  type="time"
                  value={formData.startTime || ""}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-600 mb-2">End time:</label>
                <Input
                  type="time"
                  value={formData.endTime || ""}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-80 p-6">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors" aria-label="Close modal">
        <X className="h-5 w-5" />
      </button>

      <form onSubmit={handleSubmit}>
        {renderForm()}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
