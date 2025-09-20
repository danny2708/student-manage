// src/components/roles/TeacherRole.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { BookOpen, Star, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { useClasses } from "../../../../../src/contexts/ClassContext";
import { ClassUpdate } from "../../../../../src/services/api/class"; 
import { useEvaluations } from "../../../../../src/hooks/useEvaluation";
import { useTeacherReviews } from "../../../../../src/hooks/useTeacherReview";
import { usePayrolls } from "../../../../../src/hooks/usePayroll";
import { EvaluationView } from "../../../../../src/services/api/evaluation";
import { TeacherReviewView } from "../../../../../src/services/api/teacherReview";
import { Payroll } from "../../../../../src/services/api/payroll";

interface User {
  user_id: number;
  username: string;
  roles: string[];
  full_name: string;
  email: string;
}

interface TeacherRoleProps {
  user: User;
}

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export function TeacherRole({ user }: TeacherRoleProps) {
  // lấy thêm editClass và getTeacherClasses từ context
  const { classes, fetchClasses, editClass, getTeacherClasses } = useClasses();
  const { fetchEvaluationsOfTeacher } = useEvaluations();
  const { fetchReviewsByTeacherId } = useTeacherReviews();
  const { fetchTeacherPayrolls } = usePayrolls();

  const [teacherEvaluations, setTeacherEvaluations] = useState<EvaluationView[]>([]);
  const [teacherReviews, setTeacherReviews] = useState<TeacherReviewView[]>([]);
  const [teacherPayrolls, setTeacherPayrolls] = useState<Payroll[]>([]);
  const [activeTab, setActiveTab] = useState("assign-class");

  const [assigningId, setAssigningId] = useState<number | null>(null);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const userId = user.user_id;

  const loadInitialData = useCallback(async () => {
    try {
      const [evals, reviews, payrolls] = await Promise.all([
        fetchEvaluationsOfTeacher(userId),
        fetchReviewsByTeacherId(userId),
        fetchTeacherPayrolls(userId),
      ]);
      await fetchClasses(); // cập nhật global classes

      if (evals) setTeacherEvaluations(evals);
      if (reviews) setTeacherReviews(reviews);
      if (payrolls) setTeacherPayrolls(payrolls);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }, [userId, fetchEvaluationsOfTeacher, fetchReviewsByTeacherId, fetchTeacherPayrolls, fetchClasses]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

 // Manager dashboard: show class chưa có teacher hoặc đã gán cho teacher khác
  const availableAssignClasses = useMemo(() => {
    return (classes || []).filter((c: any) => {
      // nếu chưa có teacher
      if (!c.teacher_user_id) return true;

      // nếu teacher hiện tại khác teacher đang click
      return c.teacher_user_id !== userId;
    });
  }, [classes, userId]);

  const handleAssignClass = async (classId: number) => {
    try {
      setAssigningId(classId);

      // build payload typed as ClassUpdate
      const payload: ClassUpdate = {
        teacher_user_id: userId,
      };

      // gọi editClass từ context (editClass = async (id:number, data: ClassUpdate))
      await editClass(classId, payload);

      toast.success("Assign thành công!");

      // reload dữ liệu
      await fetchClasses();
      try { await getTeacherClasses(userId); } catch (err) { /* non-blocking */ }
      await loadInitialData();
    } catch (err: any) {
      console.error("Assign failed:", err);
      toast.error(err?.message || "Gán lớp thất bại");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* --- Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Available to Assign</CardTitle>
              <BookOpen className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{availableAssignClasses.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Evaluations Given</CardTitle>
              <Star className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{teacherEvaluations.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Student Reviews</CardTitle>
              <Users className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{teacherReviews.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[250px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{formatVND(teacherPayrolls[0]?.total || 0)}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- Tabs --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700 border-slate-600">
          <TabsTrigger value="assign-class" className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white">Assign Class</TabsTrigger>
          <TabsTrigger value="evaluations" className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white">Evaluations</TabsTrigger>
          <TabsTrigger value="reviews" className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white">Reviews</TabsTrigger>
          <TabsTrigger value="payroll" className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white">Payroll</TabsTrigger>
        </TabsList>

        {/* Assign Class tab */}
        <TabsContent value="assign-class" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Available Classes</CardTitle>
              <CardDescription className="text-slate-300">Select a class to assign yourself to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableAssignClasses.length > 0 ? (
                  availableAssignClasses.map((cls: any) => (
                    <motion.div key={cls.class_id ?? cls.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-600" whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <div>
                        <h3 className="font-semibold text-white">{cls.class_name}</h3>
                        <p className="text-sm text-slate-300">Capacity: {cls.capacity}</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleAssignClass(Number(cls.class_id ?? cls.id))}
                          disabled={assigningId === Number(cls.class_id ?? cls.id)}
                          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {assigningId === Number(cls.class_id ?? cls.id) ? "Assigning..." : "Assign to Me"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-slate-400">Không có lớp nào có thể gán.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluations tab (giữ nguyên) */}
        <TabsContent value="evaluations" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Student</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Content</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherEvaluations.map((ev) => (
                    <TableRow key={ev.id} className="border-slate-600">
                      <TableCell className="text-white">{ev.id}</TableCell>
                      <TableCell className="text-white">{ev.student}</TableCell>
                      <TableCell className="text-white">{ev.type}</TableCell>
                      <TableCell className="text-white">{ev.content}</TableCell>
                      <TableCell className="text-white">{formatDate(ev.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews tab (giữ nguyên) */}
        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Student Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">Student</TableHead>
                    <TableHead className="text-white">Rating</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherReviews.map((r) => (
                    <TableRow key={r.id} className="border-slate-600">
                      <TableCell className="text-white">{r.student_name}</TableCell>
                      <TableCell>
                        <div className="flex">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{formatDate(r.review_date)}</TableCell>
                      <TableCell className="text-white">{r.review_content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll tab (giữ nguyên) */}
        <TabsContent value="payroll" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Payroll Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Month</TableHead>
                    <TableHead className="text-white">Base Salary</TableHead>
                    <TableHead className="text-white">Reward Bonus</TableHead>
                    <TableHead className="text-white">Total</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherPayrolls.map((p) => (
                    <TableRow key={p.id} className="border-slate-600">
                      <TableCell className="text-white">{p.id}</TableCell>
                      <TableCell className="text-white">{p.month}</TableCell>
                      <TableCell className="text-white">{formatVND(p.base_salary)}</TableCell>
                      <TableCell className="text-white">{formatVND(p.bonus)}</TableCell>
                      <TableCell className="font-semibold text-green-400">{formatVND(p.total)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={p.status === "paid" ? "default" : "secondary"}
                          className={p.status === "pending" ? "bg-yellow-500 text-white hover:bg-yellow-400" : ""}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{formatDate(p.sent_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
