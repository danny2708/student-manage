"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { BookOpen, Star, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

import { useClasses } from "../../../../../src/contexts/ClassContext";
import { useEnrollment } from "../../../../../src/hooks/useEnrollment";
import { useTeacherReviews } from "../../../../../src/hooks/useTeacherReview";
import { useEvaluations } from "../../../../../src/hooks/useEvaluation";

interface User {
  user_id: number;
  username: string;
  roles: string[];
  full_name: string;
  email: string;
}

interface StudentRoleProps {
  user: User;
}

export function StudentRole({ user }: StudentRoleProps) {
  const { classes, fetchClasses } = useClasses();
  const { addEnrollment, getEnrollmentsByStudentId } = useEnrollment();
  const { fetchSummaryAndCounts, fetchEvaluationsOfStudent } = useEvaluations();
  const {
    reviews: studentReviews,
    fetchReviewsByStudentId,
  } = useTeacherReviews();

  const [studentEvaluations, setStudentEvaluations] = useState<any[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [summary, setSummary] = useState({ study_points: 0, discipline_points: 0 });
  const [activeTab, setActiveTab] = useState("add-class");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const loadInitialData = useCallback(async () => {
    const userId = user.user_id;

    const [enrolls, evals, total, reviews] = await Promise.all([
      getEnrollmentsByStudentId(userId),
      fetchEvaluationsOfStudent(userId),
      fetchSummaryAndCounts(userId),
      fetchReviewsByStudentId(userId),
    ]);

    if (enrolls) {
      setStudentEnrollments(
        enrolls.map((e) => ({
          ...e,
          enrollment_date: formatDate(e.enrollment_date),
        }))
      );
    } else {
      setStudentEnrollments([]);
    }

    if (evals) {
      setStudentEvaluations(
        evals.map((ev: any) => ({
          ...ev,
          evaluation_date: formatDate(ev.evaluation_date), // Đổi từ ev.date sang ev.evaluation_date
        }))
      );
    } else {
      setStudentEvaluations([]);
    }

    if (total) {
      setSummary({
        study_points: total.final_study_point,
        discipline_points: total.final_discipline_point,
      });
    }

    // reviews đã được xử lý bởi hook useTeacherReviews, không cần setState riêng
  }, [user.user_id, getEnrollmentsByStudentId, fetchEvaluationsOfStudent, fetchReviewsByStudentId, fetchSummaryAndCounts]);

  useEffect(() => {
    fetchClasses();
    loadInitialData();
  }, [fetchClasses, loadInitialData]);

  const handleEnrollInClass = async (classId: number) => {
    await addEnrollment({
      student_user_id: user.user_id,
      class_id: classId,
      enrollment_date: new Date().toISOString().split("T")[0],
    });
    const enrolls = await getEnrollmentsByStudentId(user.user_id);
    setStudentEnrollments(enrolls ?? []);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Study Points
              </CardTitle>
              <Award className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {summary.study_points}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Discipline Points
              </CardTitle>
              <Star className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {summary.discipline_points}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Enrolled Classes
              </CardTitle>
              <BookOpen className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {studentEnrollments.length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Teacher Reviews
              </CardTitle>
              <Users className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {studentReviews.length}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- Tabs --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700 border-slate-600">
          <TabsTrigger
            value="add-class"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Add to Class
          </TabsTrigger>
          <TabsTrigger
            value="enrollments"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Enrollments
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
            Teacher Reviews
          </TabsTrigger>
        </TabsList>

        {/* --- Tab: Add class --- */}
        <TabsContent value="add-class" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Available Classes</CardTitle>
              <CardDescription className="text-slate-300">
                Select a class to enroll in
              </CardDescription>
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
                      <h3 className="font-semibold text-white">
                        {cls.class_name}
                      </h3>
                      <p className="text-sm text-slate-300">
                        Teacher: {cls.teacher_name}
                      </p>
                      <p className="text-sm text-slate-300">
                        Capacity: {cls.capacity}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => handleEnrollInClass(cls.class_id)}
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Enroll
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab: Enrollments --- */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">My Enrollments</CardTitle>
              <CardDescription className="text-slate-300">
                Your enrolled classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">Class Name</TableHead>
                    <TableHead className="text-white">Enrollment Date</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEnrollments.map((enr) => (
                    <TableRow key={enr.id} className="border-slate-600">
                      <TableCell className="text-white">{enr.class_name}</TableCell>
                      <TableCell className="text-white">{enr.enrollment_date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enr.enrollment_status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {enr.enrollment_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab: Evaluations --- */}
        <TabsContent value="evaluations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Total Study Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-400">
                    {summary.study_points}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Total Discipline Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-400">
                    {summary.discipline_points}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Individual Evaluations</CardTitle>
              <CardDescription className="text-slate-300">
                Detailed evaluation history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Teacher</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Content</TableHead>
                    <TableHead className="text-white">Evaluation Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEvaluations.map((ev) => (
                    <TableRow key={ev.id} className="border-slate-600">
                      <TableCell className="text-white">{ev.id}</TableCell>
                      <TableCell className="text-white">{ev.teacher}</TableCell>
                      <TableCell className="text-white">{ev.type}</TableCell>
                      <TableCell className="text-white">{ev.content}</TableCell>
                      <TableCell className="text-white">{ev.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab: Reviews --- */}
        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Teacher Reviews</CardTitle>
              <CardDescription className="text-slate-300">
                Reviews from your teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">Teacher Name</TableHead>
                    <TableHead className="text-white">Rating</TableHead>
                    <TableHead className="text-white">Review Date</TableHead>
                    <TableHead className="text-white">Review Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentReviews.map((r) => (
                    <TableRow key={r.id} className="border-slate-600">
                      <TableCell className="text-white">{r.teacher_name}</TableCell>
                      <TableCell>
                        <div className="flex">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
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
      </Tabs>
    </div>
  );
}