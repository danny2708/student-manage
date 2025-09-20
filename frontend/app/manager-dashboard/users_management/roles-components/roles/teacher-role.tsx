"use client";

import { useEffect, useState, useCallback } from "react";
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

import { useClasses } from "../../../../../src/contexts/ClassContext";
import { useEvaluations } from "../../../../../src/hooks/useEvaluation";
import { useTeacherReviews} from "../../../../../src/hooks/useTeacherReview";
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
  const { classes, fetchClasses } = useClasses();
  const { fetchEvaluationsOfTeacher } = useEvaluations();
  const { fetchReviewsByTeacherId } = useTeacherReviews();
  const { fetchTeacherPayrolls } = usePayrolls();

  const [teacherEvaluations, setTeacherEvaluations] = useState<EvaluationView[]>([]);
  const [teacherReviews, setTeacherReviews] = useState<TeacherReviewView[]>([]);
  const [teacherPayrolls, setTeacherPayrolls] = useState<Payroll[]>([]);

  const [activeTab, setActiveTab] = useState("assign-class");
  
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const userId = user.user_id;

  const loadInitialData = useCallback(async () => {
    try {
      const evals = await fetchEvaluationsOfTeacher(userId);
      const reviews = await fetchReviewsByTeacherId(userId);
      const payrolls = await fetchTeacherPayrolls(userId);
      await fetchClasses(); 

      if (evals !== undefined && evals !== null) {
        setTeacherEvaluations(evals);
      }
      if (reviews !== undefined && reviews !== null) {
        setTeacherReviews(reviews);
      }
      if (payrolls !== undefined && payrolls !== null) {
        setTeacherPayrolls(payrolls);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }, [userId, fetchEvaluationsOfTeacher, fetchReviewsByTeacherId, fetchTeacherPayrolls, fetchClasses]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleAssignClass = async (classId: number) => {
    console.log(`Assigning to class ${classId}`);
    // TODO: Gọi API updateClass(classId, { teacher_id: currentTeacherId })
  };

  return (
    <div className="space-y-6 text-white">
      {/* --- Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Assigned Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{classes.length}</div>
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
          <TabsTrigger
            value="assign-class"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Assign Class
          </TabsTrigger>
          <TabsTrigger
            value="evaluations"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Evaluations
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="payroll"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Payroll
          </TabsTrigger>
        </TabsList>

        {/* --- Assign Class --- */}
        <TabsContent value="assign-class" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Available Classes</CardTitle>
              <CardDescription className="text-slate-300">Select a class to assign yourself to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {classes.map((cls) => (
                  <motion.div
                    key={cls.class_id}
                    className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-600"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <h3 className="font-semibold text-white">{cls.class_name}</h3>
                      <p className="text-sm text-slate-300">Capacity: {cls.capacity}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => handleAssignClass(cls.class_id)}
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Assign to Me
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Evaluations --- */}
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

        {/* --- Reviews --- */}
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

        {/* --- Payroll --- */}
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