import * as React from "react"
import { Star, Settings } from "lucide-react"
import { useTeacherReviews } from "../../../src/hooks/useTeacherReview"

interface TeacherReviewManagementProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
}

export default function TeacherReviewManagement({
  searchTerm,
  updateSearchTerm,
}: TeacherReviewManagementProps) {
  const { reviews, loading, error } = useTeacherReviews()
  const term = searchTerm?.toLowerCase() ?? ""

  const filteredReviews = reviews.filter(
    (r) =>
      (r.review_text ?? "").toLowerCase().includes(term) ||
      (r.teacher_name ?? "").toLowerCase().includes(term) ||
      (r.student_name ?? "").toLowerCase().includes(term)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Review Management</h2>
      </div>

      <div className="text-gray-900 flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("teacherReview", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Star className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="text-gray-300">Loading reviews...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-16">ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-40">TEACHER</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-40">STUDENT</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-24">RATING</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">REVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-3 text-sm text-gray-300">{review.id}</td>
                  <td className="px-3 py-3 text-sm text-gray-300 break-words">{review.teacher_name}</td>
                  <td className="px-3 py-3 text-sm text-gray-300 break-words">{review.student_name}</td>
                  <td className="px-3 py-3 text-sm text-yellow-400">
                    {"★".repeat(Math.round(review.rating))}
                    {"☆".repeat(5 - Math.round(review.rating))}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-300 break-words">{review.review_text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
