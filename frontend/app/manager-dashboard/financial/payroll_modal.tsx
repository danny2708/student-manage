"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { X, Search, Filter } from "lucide-react"

interface Payroll {
  id: number
  teacher: string
  base_salary: number
  bonus: number
  total: number
  status: "paid" | "pending"
  sent_at: string
}

interface PayrollModalProps {
  payrolls: Payroll[]
  onClose: () => void
}

export function PayrollModal({ payrolls, onClose }: PayrollModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPayrolls = payrolls.filter((payroll) =>
    payroll.teacher.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString("vi-VN") || ""} vnđ`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Payroll Management</h2>
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
                placeholder="Search teacher..."
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

        {/* Table */}
        <div className="overflow-auto max-h-[60vh] bg-gray-800">
          <table className="w-full">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Teacher Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sent At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredPayrolls.map((payroll) => (
                <tr key={payroll.id} className="hover:bg-gray-700 cursor-pointer">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{payroll.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-cyan-400 font-medium">
                    {payroll.teacher}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatCurrency(payroll.base_salary)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(payroll.bonus)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-300">
                    {formatCurrency(payroll.total)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payroll.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payroll.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{payroll.sent_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export type { Payroll }