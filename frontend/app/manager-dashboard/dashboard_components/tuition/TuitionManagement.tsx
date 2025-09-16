"use client";

import * as React from "react";
import { DollarSign, Settings } from "lucide-react";
import { useTuitions } from "../../../../src/hooks/useTuition";
import { ShowInfoModal } from "../../functions/show_info_modal";
import { ActionModal } from "../../functions/action_modal";

// Import component form tạo mới
import { CreateTuitionForm } from "./CreateTuitionForm";

interface TuitionManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
}

export default function TuitionManagement({
  searchTerm,
  updateSearchTerm,
}: TuitionManagementProps) {
  const { tuitions, refetch, removeTuition } = useTuitions();
  const [selected, setSelected] = React.useState<any>(null);
  const [showActionModal, setShowActionModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false); // Thêm state để quản lý modal tạo mới

  const filteredTuitions = tuitions.filter(
    (t) =>
      t.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    `${amount?.toLocaleString("en-US") || ""} vnđ`;

  const handleRowClick = (t: any) => {
    setSelected(t);
    setShowActionModal(true);
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await removeTuition(selected.id);
      alert("Xoá học phí thành công!");
      setShowActionModal(false);
    } catch (err) {
      console.error(err);
      alert("Xoá học phí thất bại!");
    }
  };

  const handleCreatedOrUpdated = async () => {
    await refetch();
  };

  return (
    <div className="space-y-4">
      {/* 🖼 Action modal */}
      {showActionModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <ActionModal
            onClose={() => setShowActionModal(false)}
            onShowInfo={() => {
              setShowActionModal(false);
              setShowInfoModal(true);
            }}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* 🖼 Show Info modal */}
      {showInfoModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <ShowInfoModal
            type="tuition"
            data={selected}
            onClose={() => setShowInfoModal(false)}
            onUpdated={handleCreatedOrUpdated}
          />
        </div>
      )}

      {/* 🖼 Create Tuition Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <CreateTuitionForm
            onClose={() => setShowCreateModal(false)}
            onCreated={handleCreatedOrUpdated}
          />
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Tuition Management
        </h2>
        <button
          onClick={() => setShowCreateModal(true)} // Mở modal tạo mới
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Create New Tuition
        </button>
      </div>

      {/* SEARCH */}
      <div className="text-gray-900 flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => updateSearchTerm("tuition", e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-black" />
        </div>
        <button className="px-4 py-2 bg-gray-500 border border-black rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-12">
                ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-40">
                STUDENT
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-24">
                AMOUNT
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-20">
                TERM
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-20">
                STATUS
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase w-24">
                DUE DATE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {filteredTuitions.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleRowClick(t)}
              >
                <td className="px-3 py-3 text-sm text-gray-300">{t.id}</td>
                <td className="px-3 py-3 text-sm text-gray-300 break-words">
                  {t.student}
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">
                  {formatCurrency(t.amount)}
                </td>
                <td className="px-3 py-3 text-sm text-cyan-400">{t.term}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      t.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : t.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-gray-300">
                  {t.due_date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}