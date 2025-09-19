"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react";

import { useTuitions } from "../../../../../src/hooks/useTuition";
import { useParents } from "../../../../../src/hooks/useParent"; 
import { Child } from "../../../../../src/services/api/parent"; 

interface User {
  user_id: number;
  username: string;
  roles: string[];
  full_name: string;
  email: string;
}

interface ParentRoleProps {
  user: User;
}

export function ParentRole({ user }: ParentRoleProps) {
  const { tuitions, fetchTuitionsByParentId } = useTuitions();
  const { fetchParentChildren } = useParents();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const parentId = user.user_id;

      // Fetch cả 2 API cùng lúc
      const [childrenData] = await Promise.all([
        fetchParentChildren(parentId),
        fetchTuitionsByParentId(parentId) // hook này tự cập nhật state tuitions
      ]);

      if (childrenData) {
        setChildren(childrenData);
      }
    } catch (err: any) {
      console.error("Failed to load parent data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [user.user_id, fetchParentChildren, fetchTuitionsByParentId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  const totalOwed = tuitions.filter((t) => t.status !== "paid").reduce((sum, t) => sum + t.amount, 0);
  const overdueCount = tuitions.filter((t) => t.status === "overdue").length;

  return (
    <div className="space-y-6">
      {/* CARD TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOwed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tuitions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tuitions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs defaultValue="children" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="tuitions">Tuitions</TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Children</CardTitle>
              <CardDescription>Information about your children</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Phone Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {children.map((child, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{child.name}</TableCell>
                      <TableCell>{child.email}</TableCell>
                      <TableCell>{child.gender}</TableCell>
                      <TableCell>{child.date_of_birth}</TableCell>
                      <TableCell>{child.phone_number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuitions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tuition Information</CardTitle>
              <CardDescription>Payment history and upcoming dues</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tuitions.map((tuition) => (
                    <TableRow key={tuition.id}>
                      <TableCell>{tuition.id}</TableCell>
                      <TableCell>{tuition.student}</TableCell>
                      <TableCell className="font-semibold">${tuition.amount}</TableCell>
                      <TableCell>{tuition.term}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tuition.status === "paid"
                              ? "default"
                              : tuition.status === "overdue"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {tuition.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tuition.due_date}</TableCell>
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
