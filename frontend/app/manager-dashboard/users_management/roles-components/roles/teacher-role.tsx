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

import { useClasses } from "../../../../../src/contexts/ClassContext";
import { useEvaluations } from "../../../../../src/hooks/useEvaluation";
import { useTeacherReviews } from "../../../../../src/hooks/useTeacherReview";
import { usePayrolls } from "../../../../../src/hooks/usePayroll";

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

export function TeacherRole({ user }: TeacherRoleProps) {
  const { classes, fetchClasses } = useClasses();
  const { evaluations, fetchEvaluationsOfTeacher } = useEvaluations();
  const { reviews, fetchReviewsByTeacherId } = useTeacherReviews();
  const { payrolls, fetchPayrolls } = usePayrolls();

  const [activeTab, setActiveTab] = useState("assign-class");
  
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const userId = user.user_id;
  const loadInitialData = useCallback(async () => {
    await Promise.all([
      fetchClasses(),
      fetchEvaluationsOfTeacher(userId),  // bạn có thể truyền teacherId nếu API cần
      fetchReviewsByTeacherId(userId),
      fetchPayrolls(),
    ]);
  }, [fetchClasses, fetchEvaluationsOfTeacher, fetchReviewsByTeacherId, fetchPayrolls]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleAssignClass = async (classId: number) => {
    console.log(`Assigning to class ${classId}`);
    // TODO: Gọi API updateClass(classId, { teacher_id: currentTeacherId })
  };

  return (
    <div className="space-y-6 text-black">
      {/* --- Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{classes.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Evaluations Given</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{evaluations.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Student Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{reviews.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrolls[0]?.total ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Tabs --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assign-class">Assign Class</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        {/* --- Assign Class --- */}
        <TabsContent value="assign-class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Classes</CardTitle>
              <CardDescription>Select a class to assign yourself to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {classes.map((cls) => (
                  <div key={cls.class_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{cls.class_name}</h3>
                      <p className="text-sm text-muted-foreground">Capacity: {cls.capacity}</p>
                    </div>
                    <Button onClick={() => handleAssignClass(cls.class_id)}>Assign to Me</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Evaluations --- */}
        <TabsContent value="evaluations" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Student Evaluations</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>{ev.id}</TableCell>
                      <TableCell>{ev.student}</TableCell>
                      <TableCell>{ev.type}</TableCell>
                      <TableCell>{ev.content}</TableCell>
                      <TableCell>{formatDate(ev.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Reviews --- */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Student Reviews</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Content</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.student_name}</TableCell>
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

        {/* --- Payroll --- */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Payroll Information</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Reward Bonus</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.month}</TableCell>
                      <TableCell>${p.base_salary}</TableCell>
                      <TableCell>${p.bonus}</TableCell>
                      <TableCell className="font-semibold">${p.total}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "paid" ? "default" : "secondary"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(p.sent_at)}</TableCell>
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
