"use client";

import { useAuth } from "../src/contexts/AuthContext";
import Auth from "../components/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import authService from "../src/services/authService";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const target = authService.getDashboardRoute();
      router.replace(target);
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-screen bg-gradient-to-b from-blue-500 to-blue-900">
      <div className="w-full h-full">
        <Auth />
      </div>
    </main>
  );
}
