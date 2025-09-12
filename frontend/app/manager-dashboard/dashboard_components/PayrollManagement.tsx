// File: components/PayrollManagement.tsx
import * as React from "react"
import { FileText, Settings } from "lucide-react"
import { mockPayrolls } from "../data/mockData"

interface PayrollManagementProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
  handleCreateNew: (type: string) => void
  handleTableRowClick: (type: string, data: any) => void
}

export default function PayrollManagement({
  searchTerm,
  updateSearchTerm,
  handleCreateNew,
  handleTableRowClick,
}: PayrollManagementProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
        <button
          onClick={() => handleCreateNew("payroll")}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Create New Payroll
        </button>
      </div>
      <div className="text-gray-900 flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search payrolls..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("payroll", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <FileText className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Filter
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">
                ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">
                TEACHER NAME
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                BASE SALARY
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                BONUS
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                TOTAL
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                STATUS
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20">
                SENT AT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {mockPayrolls.map((payroll) => (
              <tr
                key={payroll.payroll_id}
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleTableRowClick("payroll", payroll)}
              >
                <td className="px-3 py-3 text-sm text-gray-300">{payroll.payroll_id}</td>
                <td className="px-3 py-3 text-sm text-gray-300 break-words">{payroll.teacherName}</td>
                <td className="px-3 py-3 text-sm text-gray-300">
                  {(payroll.baseSalary / 1000000).toFixed(1)}M ₫
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">{(payroll.bonus / 1000).toFixed(0)}K ₫</td>
                <td className="px-3 py-3 text-sm text-gray-300">{(payroll.total / 1000000).toFixed(1)}M ₫</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payroll.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payroll.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">{payroll.sentAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}