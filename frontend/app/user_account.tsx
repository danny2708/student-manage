"use client";

import {
  X, User, Calendar, Mail, Phone, Lock, PenSquare, GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useUsers } from "../src/contexts/UsersContext";

interface UserAccountModalProps {
  user: {
    username?: string;
    // GIỮ CÁC TRƯỜNG DỰ PHÒNG CŨ (dob, phone, user_roles) để đảm bảo tương thích ngược
    user_roles?: string[];
    dob?: string; 
    phone?: string;
    
    // CẬP NHẬT: Thêm/Ưu tiên các trường mới từ API/Context
    roles?: string[]; // Đã được normalize trong UsersContext
    date_of_birth?: string; // 'YYYY-MM-DD'
    phone_number?: string;
    
    user_id: number;
    full_name?: string;
    email?: string;
    gender?: string;
    password?: string;
  };
  onClose: () => void;
}

// format helpers
const formatDateToDDMMYYYY = (dateString?: string) => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

const convertDDMMYYYYtoYYYYMMDD = (dateString: string): string | null => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  if (match) {
    const [, day, month, year] = match;
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y > 1900 && y < 2100) {
        // preserve leading zeros from the input
        return `${year}-${month}-${day}`;
    }
  }
  return null;
};

const capitalizeFirstLetter = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export function UserAccountModal({ user, onClose }: UserAccountModalProps) {
  const { editUser, updatePassword } = useUsers();
  const [isEditing, setIsEditing] = useState(false);
  
  // HÀM HELPER: Lấy giá trị data ưu tiên trường mới, fallback về trường cũ
  const getField = (newKey: string, oldKey: string) => {
      return (user as any)?.[newKey] ?? (user as any)?.[oldKey] ?? "";
  };
  
  // Safe defaults to avoid controlled -> uncontrolled
  const initialUserData = {
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    // FIX: Ưu tiên phone_number, fallback về phone
    phone: getField('phone_number', 'phone'),
    gender: user?.gender ? String(user.gender).toLowerCase() : "",
    // FIX: Ưu tiên date_of_birth, fallback về dob
    dob: getField('date_of_birth', 'dob'), 
    old_password: "",
    password: "",
  };

  // FIX: Ưu tiên roles (đã được normalized từ UsersContext), fallback về user_roles
  const rolesList: string[] = Array.isArray((user as any)?.roles) && (user as any).roles.length > 0
    ? (user as any).roles
    : Array.isArray(user?.user_roles) && user.user_roles.length > 0
    ? user.user_roles
    : [];

  const [userData, setUserData] = useState(initialUserData);

  // DOB text for input (DD/MM/YYYY)
  const [inputDobText, setInputDobText] = useState(formatDateToDDMMYYYY(initialUserData.dob));

  // Sync local state when prop `user` changes
  useEffect(() => {
    // Tái tính toán các giá trị khi prop `user` thay đổi
    const newPhone = getField('phone_number', 'phone');
    const newDob = getField('date_of_birth', 'dob');
    
    setUserData({
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      phone: newPhone,
      gender: user?.gender ? String(user.gender).toLowerCase() : "",
      dob: newDob,
      old_password: "",
      password: "",
    });
    setInputDobText(formatDateToDDMMYYYY(newDob));
    setIsEditing(false);
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDobChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputDobText(input);
    const convertedDate = convertDDMMYYYYtoYYYYMMDD(input);
    if (convertedDate) {
        setUserData((prev) => ({ ...prev, dob: convertedDate }));
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && !convertDDMMYYYYtoYYYYMMDD(inputDobText)) {
          console.error("Invalid Date of Birth format. Please use DD/MM/YYYY.");
          return;
      }

      // FIX: Đảm bảo payload gửi lên API dùng các tên trường mới
      // và bảo toàn `roles` hiện có (component này ko sửa role nên gửi kèm để tránh server overwrite)
      const payload: any = {
        full_name: userData.full_name,
        email: userData.email,
        phone_number: userData.phone, // Sử dụng phone_number cho API
        gender: userData.gender ? userData.gender.toLowerCase() : userData.gender,
        date_of_birth: userData.dob, // Sử dụng date_of_birth cho API
        // bảo toàn roles hiện tại (nếu API overwrite khi thiếu trường này)
        roles: rolesList,
      };

      console.log("UserAccountModal: sending editUser payload:", payload);

      const res = await editUser(user.user_id, payload as any);
      console.log("UserAccountModal: editUser returned:", res);

      if (userData.old_password.trim() && userData.password.trim()) {
        await updatePassword(user.user_id, {
          old_password: userData.old_password,
          new_password: userData.password,
        });
      }

      setIsEditing(false);
      // if parent/auth context updated, useEffect on `user` will sync userData on next prop change
    } catch (err: any) {
      console.error("Failed to save user:", err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager": return "bg-purple-100 text-purple-800 border-purple-200";
      case "teacher": return "bg-orange-100 text-orange-800 border-orange-200";
      case "student": return "bg-green-100 text-green-800 border-green-200";
      case "parent": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-xl w-full h-full flex flex-col overflow-hidden">
      <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500 transition-colors">
        <X className="h-6 w-6" />
      </button>

      <div className="flex flex-1">
        {/* Left panel */}
        <div className="relative bg-gradient-to-br from-red-400 to-red-500 text-white p-6 flex flex-col items-center justify-center w-60">
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3 border-4 border-white border-opacity-30">
            <User className="h-12 w-12 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{user?.username ?? "—"}</h3>
          <div className="flex flex-wrap gap-1 mb-3">
            {/* FIX: Hiển thị rolesList đã được chuẩn hóa */}
            {rolesList.length > 0 ? (
              rolesList.map((role) => (
                <Badge key={role} className={getRoleBadgeColor(role)}>{capitalizeFirstLetter(role)}</Badge>
              ))
            ) : (
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">No role</Badge>
            )}
          </div>
          <button
            aria-label="Edit"
            onClick={() => {
              setIsEditing(!isEditing);
              if (!isEditing) {
                // Đảm bảo DOB được reset về giá trị ban đầu (định dạng DD/MM/YYYY)
                setInputDobText(formatDateToDDMMYYYY(userData.dob));
              }
            }}
            className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-full"
          >
            <PenSquare className="h-4 w-4" />
          </button>
        </div>

        {/* Right panel */}
        <div className="p-6 flex-1 bg-white flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Information</h2>
          <div className="grid grid-cols-2 gap-y-8 gap-x-12 text-base">
            {/* ID */}
            <div className="flex items-center gap-2 text-cyan-500">
              <User className="h-5 w-5" />
              <span className="font-medium">ID</span>
              <p className="text-gray-600">{String(user?.user_id ?? "").padStart(2, "0")}</p>
            </div>

            {/* Gender */}
            <div className="flex items-center gap-2 text-pink-500">
              <span className="text-lg">⚥</span>
              <span className="font-medium">Gender</span>
              {isEditing ? (
                <select
                  aria-label="Gender"
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-gray-600 outline-none border-b border-pink-500"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="flex-1 text-gray-600">{capitalizeFirstLetter(userData.gender)}</p>
              )}
            </div>

            {/* DOB */}
            <div className="flex items-center gap-2 text-blue-500">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Date of birth</span>
              {isEditing ? (
                <Input
                  type="text"
                  name="dob"
                  placeholder="DD/MM/YYYY"
                  value={inputDobText}
                  onChange={handleDobChange}
                  className="flex-1 bg-transparent text-gray-600 outline-none border-b border-blue-500"
                />
              ) : (
                // FIX: Hiển thị DOB từ userData.dob (đã được sync từ date_of_birth)
                <p className="flex-1 text-gray-600">{formatDateToDDMMYYYY(userData.dob)}</p>
              )}
            </div>

            {/* Full name */}
            <div className="flex items-center gap-2 text-purple-500">
              <User className="h-5 w-5" />
              <span className="font-medium">Full name</span>
              <Input
                type="text"
                name="full_name"
                value={userData.full_name}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${isEditing ? "border-purple-500" : "border-transparent"}`}
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-green-500">
              <Mail className="h-5 w-5" />
              <span className="font-medium">Email</span>
              <Input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${isEditing ? "border-green-500" : "border-transparent"}`}
              />
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-blue-400">
              <Phone className="h-5 w-5" />
              <span className="font-medium">Phone</span>
              <Input
                type="tel"
                name="phone"
                // FIX: Dùng userData.phone (đã được sync từ phone_number)
                value={userData.phone}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${isEditing ? "border-blue-400" : "border-transparent"}`}
              />
            </div>

            {/* Old Password */}
            {isEditing && (
              <div className="flex items-center gap-2 text-gray-600">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Current Password</span>
                <input
                  type="password"
                  name="old_password"
                  value={userData.old_password}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="flex-1 bg-transparent text-gray-600 outline-none border-b border-gray-600"
                />
              </div>
            )}

            {/* New Password */}
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Lock className="h-5 w-5" />
              <span className="font-medium">New Password</span>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Enter new password"
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${isEditing ? "border-gray-600" : "border-transparent"}`}
              />
            </div>
          </div>

          {isEditing && (
            <button
              onClick={handleSave}
              className="mt-6 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 self-end"
            >
              Save changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
