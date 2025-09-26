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
    dob: string; // Expected format is 'YYYY-MM-DD' from database
    phone: string;
    password?: string;
  };
  onClose: () => void;
}

// Helper function to format date from 'YYYY-MM-DD' to 'DD/MM/YYYY'
const formatDateToDDMMYYYY = (dateString: string) => {
  if (!dateString) return "";
  // dateString is expected to be 'YYYY-MM-DD'
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

// New helper function to parse DD/MM/YYYY string to YYYY-MM-DD format
const convertDDMMYYYYtoYYYYMMDD = (dateString: string): string | null => {
  // Regex to check and capture day, month, year in DD/MM/YYYY format
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  if (match) {
    // Note: match[0] is the full string, [1] is day, [2] is month, [3] is year
    const [, day, month, year] = match;
    
    // Very basic sanity check (for production, use a proper date library like date-fns)
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);

    // Ensure month is 1-12, day is 1-31, and year is reasonable
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y > 1900 && y < 2100) {
        return `${year}-${month}-${day}`;
    }
  }
  return null; // Return null if format is incorrect or date is invalid
};


export function UserAccountModal({ user, onClose }: UserAccountModalProps) {
  const { editUser, updatePassword } = useUsers(); 
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob, // Keeps 'YYYY-MM-DD' (API format)
    old_password: "",
    password: "",
  });

  // State to hold the DD/MM/YYYY text input value when editing
  const [inputDobText, setInputDobText] = useState(formatDateToDDMMYYYY(user.dob));

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Dedicated handler for DOB input
  const handleDobChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputDobText(input); // Update the text input immediately (e.g., '01/0' while typing)

    // Attempt to convert the input (which is in DD/MM/YYYY format) to the API-safe format
    const convertedDate = convertDDMMYYYYtoYYYYMMDD(input);

    if (convertedDate) {
        // If conversion is successful (i.e., user entered a valid date), update the API state
        setUserData((prev) => ({ ...prev, dob: convertedDate }));
    }
    // If conversion fails (i.e., user is mid-typing), we only update inputDobText, 
    // and userData.dob retains the last valid 'YYYY-MM-DD' value.
  };

  const handleSave = async () => {
    try {
      // Check if the current input text is a valid date before saving
      if (isEditing && !convertDDMMYYYYtoYYYYMMDD(inputDobText)) {
          // In a real application, you would show an error message here
          console.error("Invalid Date of Birth format. Please use DD/MM/YYYY.");
          return; 
      }

      // 1️⃣ Update profile using context
      // userData.dob already contains the API-safe 'YYYY-MM-DD' value thanks to handleDobChange
      await editUser(user.user_id, {
        full_name: userData.full_name,
        email: userData.email,
        phone_number: userData.phone, 
        gender: userData.gender,
        date_of_birth: userData.dob, 
      });

      // 2️⃣ Update password if entered, using context
      if (userData.old_password.trim() && userData.password.trim()) {
        await updatePassword(user.user_id, {
          old_password: userData.old_password,
          new_password: userData.password,
        });
      }

      setIsEditing(false);
    } catch (err: any) {
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
            onClick={() => {
              setIsEditing(!isEditing);
              // Reset input text state when entering edit mode
              if (!isEditing) {
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
              {isEditing ? (
                // Use input type="text" and display the DD/MM/YYYY formatted date
                <Input
                  type="text"
                  name="dob"
                  placeholder="DD/MM/YYYY"
                  value={inputDobText}
                  onChange={handleDobChange}
                  className="flex-1 bg-transparent text-gray-600 outline-none border-b border-blue-500"
                />
              ) : (
                // Display formatted date (DD/MM/YYYY) when not editing
                <p className="flex-1 text-gray-600">
                  {formatDateToDDMMYYYY(userData.dob)}
                </p>
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
