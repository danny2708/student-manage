"use client";

import * as React from "react";
import { FileText, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionModal } from "../../showInfo/action_modal";
import { ShowInfoModal } from "../../showInfo/ShowInfoModal";
import { ConfirmModal } from "../../../../components/common/ConfirmModal"; // Import ConfirmModal
import { useConfirmDialog } from "../../../../src/hooks/useConfirmDialog"; // Import useConfirmDialog
import { usePayrolls } from "../../../../src/hooks/usePayroll";
import { CreatePayrollForm } from "./CreatePayrollForm";
import { Input } from "../../../../components/ui/input";
import { useAuth } from "../../../../src/contexts/AuthContext"; // Giả định import useAuth

// Tên các filter/cột cho popover
type FilterKey = "teacher" | "status" | "base" | "bonus" | "total";
interface PopoverPosition { left: number; top: number; show: boolean }

interface FilterPopoverProps {
    name: string;
    position: PopoverPosition;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}

const FilterPopover: React.FC<FilterPopoverProps> = ({ name, position, value, onChange, options }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        style={{ position: "absolute", top: position.top, left: position.left }}
        className="z-50 mt-2 w-48 bg-white border rounded shadow-lg p-3 text-gray-900"
    >
        <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">{name}</label>
        <select
            aria-label={`Select ${name} to filter`}
            value={value}
            onChange={onChange}
            className="w-full border p-2 text-sm rounded"
        >
            <option value="">All</option>
            {options.map((option) => (
                <option key={option} value={option}>{option || "(Empty)"}</option>
            ))}
        </select>
    </motion.div>
);

interface RangeFilterPopoverProps {
    name: string;
    position: PopoverPosition;
    min: string;
    max: string;
    setMin: (value: string) => void;
    setMax: (value: string) => void;
    onApply: () => void;
}

const RangeFilterPopover: React.FC<RangeFilterPopoverProps> = ({ name, position, min, max, setMin, setMax, onApply }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        style={{ position: "absolute", top: position.top, left: position.left }}
        className="z-50 mt-2 w-52 bg-white border rounded shadow-lg p-3 text-gray-900 space-y-2"
    >
        <label className="text-sm font-medium text-gray-700 block capitalize">{name}</label>
        <Input
            type="number" placeholder="Min"
            value={min} onChange={(e) => setMin(e.target.value)}
            className="w-full border p-2 text-sm rounded text-gray-900" // Đảm bảo text-gray-900 cho input bên trong popover
        />
        <Input
            type="number" placeholder="Max"
            value={max} onChange={(e) => setMax(e.target.value)}
            className="w-full border p-2 text-sm rounded text-gray-900" // Đảm bảo text-gray-900 cho input bên trong popover
        />
        <button
            onClick={onApply}
            className="w-full mt-2 px-2 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
        >
            Apply
        </button>
    </motion.div>
);

// --- MAIN COMPONENT ---
export default function PayrollManagement() {
    const { user } = useAuth(); // Sử dụng useAuth hook
    const { payrolls, fetchPayrolls, removePayroll } = usePayrolls();
    const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog(); // Dùng hook Confirm

    React.useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [showAction, setShowAction] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);
    const [showCreateModal, setShowCreateModal] = React.useState(false);

    // === FILTER STATES ===
    const [openPopover, setOpenPopover] = React.useState<FilterKey | null>(null);
    const [filterTeacher, setFilterTeacher] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("");
    const [baseMin, setBaseMin] = React.useState("");
    const [baseMax, setBaseMax] = React.useState("");
    const [bonusMin, setBonusMin] = React.useState("");
    const [bonusMax, setBonusMax] = React.useState("");
    const [totalMin, setTotalMin] = React.useState("");
    const [totalMax, setTotalMax] = React.useState("");

    // Refs
    const filterButtonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    // Lấy danh sách giáo viên duy nhất
    const teacherOptions = React.useMemo(() => Array.from(new Set(payrolls.map((p) => p.teacher).filter(Boolean))), [payrolls]);
    const statusOptions = ["paid", "pending"];

    // Lọc payrolls theo toàn bộ tiêu chí
    const filteredPayrolls = payrolls.filter((p) => {
        const matchesSearch = (p.teacher ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesTeacher = filterTeacher ? p.teacher === filterTeacher : true;
        const matchesStatus = filterStatus ? p.status === filterStatus : true;

        const matchesBase =
            (!baseMin || p.base_salary >= Number(baseMin)) &&
            (!baseMax || p.base_salary <= Number(baseMax));

        const matchesBonus =
            (!bonusMin || p.bonus >= Number(bonusMin)) &&
            (!bonusMax || p.bonus <= Number(bonusMax));

        const matchesTotal =
            (!totalMin || p.total >= Number(totalMin)) &&
            (!totalMax || p.total <= Number(totalMax));

        return (
            matchesSearch &&
            matchesTeacher &&
            matchesStatus &&
            matchesBase &&
            matchesBonus &&
            matchesTotal
        );
    });

    const formatCurrency = (amount: number) =>
        `${amount?.toLocaleString("en-US") || ""} vnđ`;

    // === HANDLERS ===
    const handleRowClick = (row: any) => {
        setSelectedRow(row);
        // Logic hiển thị ActionModal/ShowInfoModal dựa trên quyền (giống tuition)
        if (user?.roles.includes("manager") || user?.roles.includes("teacher")) {
            setShowAction(true);
        } else {
            setShowInfo(true);
        }
    };

    const handleDelete = async () => {
        try {
            if (selectedRow) {
                await removePayroll(selectedRow.id);
                closeConfirm(); // Đóng ConfirmModal
                setShowAction(false); // Đóng ActionModal nếu nó mở
                await fetchPayrolls(); // Tải lại danh sách
            }
        } catch (err) {
            console.error(err);
            alert("Xoá thất bại!");
        }
    };

    const handleCreated = async () => {
        await fetchPayrolls();
    };

    const handleBackdropClick = (
        e: React.MouseEvent<HTMLDivElement>,
        close: () => void
    ) => {
        if (e.target === e.currentTarget) close();
    };

    const resetFilters = React.useCallback(() => {
        setFilterTeacher("");
        setFilterStatus("");
        setBaseMin("");
        setBaseMax("");
        setBonusMin("");
        setBonusMax("");
        setTotalMin("");
        setTotalMax("");
        setSearchTerm("");
        setOpenPopover(null);
    }, []);

    // Click outside to close popovers
    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) {
                setOpenPopover(null);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // Function to calculate popover position relative to the root div (Đã chỉnh sửa để dùng PopoverPosition)
    const getPopoverPosition = (filterName: FilterKey): PopoverPosition => {
        const button = filterButtonRefs.current[filterName];
        if (!button || !rootRef.current) return { left: 0, top: 0, show: false };

        const buttonRect = button.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();

        const top = buttonRect.bottom - rootRect.top + 5;
        const left = buttonRect.left - rootRect.left;

        const popoverWidth = 208; // w-52
        let finalLeft = left;

        // Điều chỉnh vị trí để popover không bị tràn bên phải
        if (left + popoverWidth > rootRect.width) {
            finalLeft = rootRect.width - popoverWidth;
        }
        if (finalLeft < 0) finalLeft = 0; // Tránh tràn bên trái

        return { left: finalLeft, top, show: openPopover === filterName };
    };

    // Định nghĩa Header Items
    const headerItems: { label: string, key: FilterKey | "ID" | "SENT AT" }[] = [
        { label: "ID", key: "ID" },
        { label: "TEACHER", key: "teacher" },
        { label: "BASE", key: "base" },
        { label: "BONUS", key: "bonus" },
        { label: "TOTAL", key: "total" },
        { label: "STATUS", key: "status" },
        { label: "SENT AT", key: "SENT AT" },
    ];

    return (
        <div className="space-y-4 relative" ref={rootRef}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
                {/* Chỉ hiển thị nút tạo nếu user có quyền */}
                {(user?.roles.includes("manager") || user?.roles.includes("teacher")) && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
                    >
                        Create New Payroll
                    </button>
                )}
            </div>

            {/* Search + Reset */}
            <div className="text-gray-900 flex items-center gap-4 mb-2">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search payrolls by teacher name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                    />
                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                    onClick={resetFilters}
                    className="px-3 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-white transition-colors cursor-pointer whitespace-nowrap text-sm"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[650px] table-auto">
                    <thead className="bg-gray-700">
                        <tr>
                            {headerItems.map((item) => (
                                <th
                                    key={item.key}
                                    className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider relative"
                                >
                                    <div className="flex items-center gap-1">
                                        <span>{item.label}</span>
                                        {(item.key === "teacher" || item.key === "status" || item.key === "base" || item.key === "bonus" || item.key === "total") && (
                                            <button
                                                ref={(el) => { filterButtonRefs.current[item.key] = el; }}
                                                aria-label={`Filter by ${item.label}`}
                                                onClick={() => {
                                                    setOpenPopover(openPopover === item.key ? null : item.key as FilterKey);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Filter className={`h-4 w-4 ${openPopover === item.key ? 'text-cyan-400' : 'text-gray-400'}`} />
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                        {filteredPayrolls.length > 0 ? (
                            filteredPayrolls.map((p) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-gray-700 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(p)}
                                >
                                    <td className="px-3 py-3 text-sm text-gray-300">{p.id}</td>
                                    <td className="px-3 py-3 text-sm text-gray-300">{p.teacher}</td>
                                    <td className="px-3 py-3 text-sm text-gray-300">
                                        {formatCurrency(p.base_salary)}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-300">
                                        {formatCurrency(p.bonus)}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-300">
                                        {formatCurrency(p.total)}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                p.status === "paid"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-300">{p.sent_at}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400">
                                    No payrolls found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ========================================================================= */}
            {/* POPUP FILTERS RENDERED HERE */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {/* Teacher Filter (Select Popover) */}
                {getPopoverPosition("teacher").show && (
                    <FilterPopover
                        name="Teacher"
                        position={getPopoverPosition("teacher")}
                        value={filterTeacher}
                        onChange={(e) => {
                            setFilterTeacher(e.target.value);
                            setOpenPopover(null);
                        }}
                        options={teacherOptions}
                    />
                )}

                {/* Status Filter (Select Popover) */}
                {getPopoverPosition("status").show && (
                    <FilterPopover
                        name="Status"
                        position={getPopoverPosition("status")}
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setOpenPopover(null);
                        }}
                        options={statusOptions}
                    />
                )}

                {/* Base Salary Filter (Range Popover) */}
                {getPopoverPosition("base").show && (
                    <RangeFilterPopover
                        name="Base Salary"
                        position={getPopoverPosition("base")}
                        min={baseMin}
                        max={baseMax}
                        setMin={setBaseMin}
                        setMax={setBaseMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}

                {/* Bonus Filter (Range Popover) */}
                {getPopoverPosition("bonus").show && (
                    <RangeFilterPopover
                        name="Bonus"
                        position={getPopoverPosition("bonus")}
                        min={bonusMin}
                        max={bonusMax}
                        setMin={setBonusMin}
                        setMax={setBonusMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}

                {/* Total Filter (Range Popover) */}
                {getPopoverPosition("total").show && (
                    <RangeFilterPopover
                        name="Total Salary"
                        position={getPopoverPosition("total")}
                        min={totalMin}
                        max={totalMax}
                        setMin={setTotalMin}
                        setMax={setTotalMax}
                        onApply={() => setOpenPopover(null)}
                    />
                )}
            </AnimatePresence>

            {/* Action Modal */}
            <AnimatePresence>
                {showAction && selectedRow && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowAction(false))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ActionModal
                            onClose={() => setShowAction(false)}
                            onShowInfo={() => { setShowAction(false); setShowInfo(true); }}
                            onDelete={
                                user?.roles.includes("manager")
                                    ? () => {
                                        setShowAction(false);
                                        // Mở ConfirmModal thay vì xoá trực tiếp
                                        openConfirm(
                                            `Bạn có chắc chắn muốn xoá payroll ${selectedRow.id}?`,
                                            handleDelete
                                        );
                                    }
                                    : undefined // Chỉ cho phép manager xoá
                            }
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal (New - Logic từ TuitionManagement) */}
            <AnimatePresence>
                {isOpen && (
                    <ConfirmModal
                      isOpen={isOpen}
                      message={message}
                      onConfirm={onConfirm}
                      onCancel={closeConfirm}
                      />
                )}
            </AnimatePresence>

            {/* Show Info Modal (Giữ nguyên) */}
            <AnimatePresence>
                {showInfo && selectedRow && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowInfo(false))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ShowInfoModal
                            type="payroll"
                            data={selectedRow}
                            onClose={() => setShowInfo(false)}
                            onUpdated={async () => { await fetchPayrolls(); }}
                            userRoles={user?.roles} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Payroll Modal (Giữ nguyên) */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleBackdropClick(e, () => setShowCreateModal(false))}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <CreatePayrollForm
                            onClose={() => setShowCreateModal(false)}
                            onCreated={handleCreated}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}