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
import { BookOpen, Star, Users, Award } from "lucide-react";

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
    loading: reviewsLoading,
    error: reviewsError,
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

    const [enrolls, evals, total] = await Promise.all([
      getEnrollmentsByStudentId(userId),
      fetchEvaluationsOfStudent(userId),
      fetchSummaryAndCounts(userId),
    ]);
    const reviews = await fetchReviewsByStudentId(userId);

    if (enrolls) {
      setStudentEnrollments(enrolls.map(e => ({
        ...e,
        enrollment_date: formatDate(e.enrollment_date),
      })));
    } else {
      setStudentEnrollments([]);
    }

    if (evals) {
      setStudentEvaluations(evals.map(ev => ({
        ...ev,
        date: formatDate(ev.date),
      })));
    } else {
      setStudentEvaluations([]);
    }

    if (total) {
      setSummary({
        study_points: total.final_study_point,
        discipline_points: total.final_discipline_point
      });
    }
  }, [user.user_id, getEnrollmentsByStudentId, fetchEvaluationsOfStudent, fetchReviewsByStudentId, fetchSummaryAndCounts]); // Removed formatDate from dependency array as it's a simple function and doesn't need to be memoized

  useEffect(() => {
    fetchClasses();
    loadInitialData();
  }, [fetchClasses, loadInitialData]);

  const handleEnrollInClass = async (classId: number) => {
    await addEnrollment({
      student_user_id: user.user_id,
      class_id: classId,
      enrollment_date: new Date().toISOString().split("T")[0]
    });
    const enrolls = await getEnrollmentsByStudentId(user.user_id);
    setStudentEnrollments(enrolls ?? []);
  };


  return (
    <div className="space-y-6 text-black">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.study_points}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Discipline Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.discipline_points}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentEnrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teacher Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentReviews.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* --- Tabs --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="add-class">Add to Class</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="reviews">Teacher Reviews</TabsTrigger>
        </TabsList>

        {/* --- Tab: Add class --- */}
        <TabsContent value="add-class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Classes</CardTitle>
              <CardDescription>Select a class to enroll in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {classes.map((cls) => (
                  <div key={cls.class_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{cls.class_name}</h3>
                      <p className="text-sm text-muted-foreground">Teacher: {cls.teacher_name}</p>
                      <p className="text-sm text-muted-foreground">Capacity: {cls.capacity}</p>
                    </div>
                    <Button onClick={() => handleEnrollInClass(cls.class_id)}>Enroll</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab: Enrollments --- */}
        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">Class Name</TableHead>
                    <TableHead className="text-black">Enrollment Date</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEnrollments.map((enr) => (
                    <TableRow key={enr.id}>
                      <TableCell>{enr.class_name}</TableCell>
                      <TableCell>{enr.enrollment_date}</TableCell>
                      <TableCell>
                        <Badge variant={enr.enrollment_status === "active" ? "default" : "secondary"}>
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
          <Card>
            <CardHeader>
              <CardTitle>Individual Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">ID</TableHead>
                    <TableHead className="text-black">Teacher</TableHead>
                    <TableHead className="text-black">Type</TableHead>
                    <TableHead className="text-black">Content</TableHead>
                    <TableHead className="text-black">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEvaluations.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>{ev.id}</TableCell>
                      <TableCell>{ev.teacher}</TableCell>
                      <TableCell>{ev.type}</TableCell>
                      <TableCell>{ev.content}</TableCell>
                      <TableCell>{ev.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab: Reviews --- */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">ID</TableHead>
                    <TableHead className="text-black">Teacher</TableHead>
                    <TableHead className="text-black">Rating</TableHead>
                    <TableHead className="text-black">Date</TableHead>
                    <TableHead className="text-black">Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentReviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.teacher_name}</TableCell>
                      <TableCell>
                        <div className="flex">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(r.review_date)}</TableCell>
                      <TableCell>{r.review_content}</TableCell>
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