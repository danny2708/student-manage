// components/SubjectManagement.tsx
import { useState } from "react"
import { useSubjects } from "../../../src/hooks/useSubject"
import { SubjectCreate, SubjectUpdate } from "../../../src/services/api/subject"

export default function SubjectManagement() {
  const { subjects, loading, addSubject, editSubject, removeSubject } = useSubjects()
  const [form, setForm] = useState<SubjectCreate>({ name: "", description: "" })
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await editSubject(editingId, form as SubjectUpdate)
      setEditingId(null)
    } else {
      await addSubject(form)
    }
    setForm({ name: "", description: "" })
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Subject Management</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tên môn học"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded">
          {editingId ? "Cập nhật" : "Thêm"}
        </button>
      </form>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Tên</th>
              <th className="border p-2">Mô tả</th>
              <th className="border p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.subject_id}>
                <td className="border p-2">{s.subject_id}</td>
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.description}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => {
                      setForm({ name: s.name, description: s.description })
                      setEditingId(s.subject_id)
                    }}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => removeSubject(s.subject_id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
