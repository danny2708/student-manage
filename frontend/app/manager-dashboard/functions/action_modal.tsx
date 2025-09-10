"use client"

import { X, Eye, Trash2 } from "lucide-react"

interface ActionModalProps {
  onClose: () => void
  onShowInfo: () => void
  onDelete: () => void
}

export function ActionModal({ onClose, onShowInfo, onDelete }: ActionModalProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl w-48 p-4">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors" aria-label="Close user information modal" >
        <X className="h-4 w-4" />
      </button>

      <div className="space-y-2 mt-4">
        <button
          onClick={onShowInfo}
          className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          Show Info
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  )
}
