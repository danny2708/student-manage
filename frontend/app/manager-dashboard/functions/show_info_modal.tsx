"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "../../../components/ui/input"

// Import interfaces from their respective files
import { Payroll } from "../financial/payroll_modal"
import { Tuition } from "../financial/tuition_modal"
import { Schedule } from "../academic/schedule_modal"
import { Class } from "../academic/class_modal"

// Combine all types into a single union type
type ModalDataType = Tuition | Payroll | Schedule | Class;


interface ShowInfoModalProps {
  type: string
  data: ModalDataType
  onClose: () => void
}

export function ShowInfoModal({ type, data, onClose }: ShowInfoModalProps) {
  const [editedData, setEditedData] = useState(data);

  const handleInputChange = (field: string, value: string | number) => {
  setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving changes:", editedData)
    onClose()
  }

  const renderFields = () => {
    // We use a temporary variable and cast for better type-safety
    const currentData = editedData;

    // A reusable function to render the ID field with centered style
    const renderIdField = (id: string) => (
      <div className="flex items-center justify-between mb-4">
        <span className="text-cyan-400 font-medium">ID</span>
        <div className="flex-1 flex justify-center">
          <span className="text-white">{id}</span>
        </div>
      </div>
    );

    switch (type) {
      case "tuition":
  const tuitionData = currentData as Tuition;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().split("T")[0];
  };

  return (
    <>
      {renderIdField(String(tuitionData.id))}

          <div className="flex items-center justify-between mb-4">
            <span className="text-cyan-400 font-medium">Student name</span>
            <Input
              type="text"
              value={tuitionData.student || ""}
              onChange={(e) => handleInputChange("student", e.target.value)}
              className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-cyan-400 font-medium">Term</span>
            <Input
              type="text"
              value={tuitionData.term || ""}
              onChange={(e) => handleInputChange("term", e.target.value)}
              className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-cyan-400 font-medium">Amount</span>
            <Input
              type="text"
              value={`${tuitionData.amount?.toLocaleString() || ""} vnd`}
              onChange={(e) =>
                handleInputChange("amount", e.target.value.replace(/[^\d]/g, ""))
              }
              className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-cyan-400 font-medium">Status</span>
            <select
              aria-label="Status"
              value={tuitionData.status || ""}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="bg-white text-gray-800 px-3 py-2 rounded border outline-none w-48 rounded"
            >
              <option value="">-- Select status --</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-cyan-400 font-medium">Due date</span>
            <Input
              type="date"
              value={formatDate(tuitionData.due_date)}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
              className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
            />
          </div>
        </>
      );
      case "payroll":
        const payrollData = currentData as Payroll;
        return (
          <>
            {renderIdField(String(payrollData.id))}
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Teacher name</span>
              <Input
                type="text"
                value={payrollData.teacher || ""}
                onChange={(e) => handleInputChange("teacher_name", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Base salary</span>
              <Input
                type="text"
                value={`${payrollData.base_salary?.toLocaleString() || ""} vnd`}
                onChange={(e) => handleInputChange("base_salary", e.target.value.replace(/[^\d]/g, ""))}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Reward bonus</span>
              <Input
                type="text"
                value={`${payrollData.bonus?.toLocaleString() || ""} vnd`}
                onChange={(e) => handleInputChange("bonus", e.target.value.replace(/[^\d]/g, ""))}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Total</span>
              <Input
                type="text"
                value={`${payrollData.total?.toLocaleString() || ""} vnd`}
                onChange={(e) => handleInputChange("total", e.target.value.replace(/[^\d]/g, ""))}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Status</span>
              <select
                aria-label="User Role"
                value={payrollData.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              >
                <option value="paid">paid</option>
                <option value="pending">pending</option>
              </select>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-cyan-400 font-medium">Sent at</span>
              <Input
                type="date"
                value={payrollData.sent_at || ""}
                onChange={(e) => handleInputChange("sentAt", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
          </>
        )
      case "schedule":
        const scheduleData = currentData as Schedule;
        return (
          <>
            {renderIdField(String(scheduleData.id))}
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Class</span>
              <Input
                type="text"
                value={scheduleData.class_name || ""}
                onChange={(e) => handleInputChange("class_name", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Day</span>
              <select
                aria-label="Day"
                value={scheduleData.day_of_week || ""}
                onChange={(e) => handleInputChange("day_of_week", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Room</span>
              <Input
                type="text"
                value={scheduleData.room || ""}
                onChange={(e) => handleInputChange("room", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Date</span>
              <Input
                type="text"
                value={scheduleData.date || ""}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Type</span>
              <select
                aria-label="Type"
                value={scheduleData.schedule_type || ""}
                onChange={(e) => handleInputChange("schedule_type", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              >
                <option value="Weekly">Weekly</option>
                <option value="Once">Once</option>
              </select>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Start</span>
              <Input
                type="time"
                value={scheduleData.start_time || ""}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-cyan-400 font-medium">End</span>
              <Input
                type="time"
                value={scheduleData.end_time || ""}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
          </>
        )
      case "class":
        const classData = currentData as Class;
        return (
          <>
            {renderIdField(String(classData.class_id))}
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Class name</span>
              <Input
                type="text"
                value={classData.class_name || ""}
                onChange={(e) => handleInputChange("class_name", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Teacher</span>
              <Input
                type="text"
                value={classData.teacher_name || ""}
                onChange={(e) => handleInputChange("teacher_name", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Subject</span>
              <Input
                type="text"
                value={classData.subject_name || ""}
                onChange={(e) => handleInputChange("subject_name", e.target.value)}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 font-medium">Capacity</span>
              <Input
                type="number"
                value={classData.capacity || ""}
                onChange={(e) => handleInputChange("capacity", Number(e.target.value))}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-cyan-400 font-medium">Fee</span>
              <Input
                type="text"
                value={`${classData.fee?.toLocaleString() || ""} vnd`}
                onChange={(e) => handleInputChange("fee", e.target.value.replace(/[^\d]/g, ""))}
                className="bg-white text-gray-800 px-3 py-2 rounded border-none outline-none w-48"
              />
            </div>
          </>
        )
      default:
        return <div className="text-white">No information available</div>
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-96 p-6 text-white relative">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors" aria-label="Close modal">
        <X className="h-5 w-5" />
      </button>

      <div className="mt-2">
        {renderFields()}

        {/* Save button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
