"use client";

import {
  X, User, Calendar, Mail, Phone, Lock, PenSquare, GraduationCap
} from "lucide-react";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useUsers } from "../src/contexts/UsersContext"; 

interface UserAccountModalProps {
  user: {
    username: string;
    roles: string[];
    user_id: number;
    full_name: string;
    email: string;
    gender: string;
    dob: string;
    phone: string;
  };
  onClose: () => void;
}

export function UserAccountModal({ user, onClose }: UserAccountModalProps) {
  const { editUser, updatePassword } = useUsers(); 
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    old_password: "",
    password: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSave = async () => {
    try {
      // 1️⃣ Update profile using context
      await editUser(user.user_id, {
        full_name: userData.full_name,
        email: userData.email,
        phone_number: userData.phone, // 🆕 Tên trường trong API là phone_number
        gender: userData.gender,
        date_of_birth: userData.dob, // 🆕 Tên trường trong API là date_of_birth
      });

      // 2️⃣ Update password if entered, using context
      if (userData.old_password.trim() && userData.password.trim()) {
        await updatePassword(user.user_id, {
          old_password: userData.old_password,
          new_password: userData.password,
        });
      }

      setIsEditing(false);
      // Context đã có toast, không cần alert() nữa
    } catch (err: any) {
      // Context đã có toast, không cần alert() nữa
      console.error(err);
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
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-500 transition-colors"
      >
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
          <h3 className="font-semibold text-lg mb-1">{user.username}</h3>
          <div className="flex flex-wrap gap-1 mb-3">
            {user.roles.length > 0 ? (
              user.roles.map((role) => (
                <Badge key={role} className={getRoleBadgeColor(role)}>{capitalizeFirstLetter(role)}</Badge>
              ))
            ) : (
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">No role</Badge>
            )}
          </div>
          <button
            aria-label="Edit"
            onClick={() => setIsEditing(!isEditing)}
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
              <p className="text-gray-600">{user.user_id.toString().padStart(2, "0")}</p>
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
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="flex-1 text-gray-600">{userData.gender}</p>
              )}
            </div>

            {/* DOB */}
            <div className="flex items-center gap-2 text-blue-500">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Date of birth</span>
              <Input
                type="date"
                name="dob"
                value={userData.dob}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${
                  isEditing ? "border-blue-500" : "border-transparent"
                }`}
              />
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
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${
                  isEditing ? "border-purple-500" : "border-transparent"
                }`}
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
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${
                  isEditing ? "border-green-500" : "border-transparent"
                }`}
              />
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-blue-400">
              <Phone className="h-5 w-5" />
              <span className="font-medium">Phone</span>
              <Input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${
                  isEditing ? "border-blue-400" : "border-transparent"
                }`}
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
                className={`flex-1 bg-transparent text-gray-600 outline-none border-b ${
                  isEditing ? "border-gray-600" : "border-transparent"
                }`}
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
