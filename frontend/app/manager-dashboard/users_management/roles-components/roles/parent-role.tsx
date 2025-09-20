"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

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

// Hàm định dạng số thành tiền VND
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

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

      const [childrenData] = await Promise.all([
        fetchParentChildren(parentId),
        fetchTuitionsByParentId(parentId)
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
    <div className="space-y-6 text-white">
      {/* CARD TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hàng trên cùng */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[250px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Owed</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{formatVND(totalOwed)}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[250px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Overdue Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{overdueCount}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hàng dưới */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[250px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Children</CardTitle>
              <Users className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{children.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-slate-700 border-slate-600 min-w-[250px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Tuitions</CardTitle>
              <Calendar className="h-4 w-4 text-slate-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{tuitions.length}</div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* TABS */}
      <Tabs defaultValue="children" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-700 border-slate-600">
          <TabsTrigger
            value="children"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Children
          </TabsTrigger>
          <TabsTrigger
            value="tuitions"
            className="cursor-pointer data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300 hover:text-white"
          >
            Tuitions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">My Children</CardTitle>
              <CardDescription className="text-slate-300">Information about your children</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-white min-w-[150px]">Student Name</TableHead>
                      <TableHead className="text-white min-w-[200px]">Email</TableHead>
                      <TableHead className="text-white min-w-[100px]">Gender</TableHead>
                      <TableHead className="text-white min-w-[120px]">Date of Birth</TableHead>
                      <TableHead className="text-white min-w-[130px]">Phone Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.map((child, index) => (
                      <TableRow key={index} className="border-slate-600">
                        <TableCell className="font-medium text-white">{child.name}</TableCell>
                        <TableCell className="text-white">{child.email}</TableCell>
                        <TableCell className="text-white">{child.gender}</TableCell>
                        <TableCell className="text-white">{child.date_of_birth}</TableCell>
                        <TableCell className="text-white">{child.phone_number}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuitions" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Tuition Information</CardTitle>
              <CardDescription className="text-slate-300">Payment history and upcoming dues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-white min-w-[60px]">ID</TableHead>
                      <TableHead className="text-white min-w-[150px]">Student</TableHead>
                      <TableHead className="text-white min-w-[180px]">Amount</TableHead>
                      <TableHead className="text-white min-w-[120px]">Term</TableHead>
                      <TableHead className="text-white min-w-[100px]">Status</TableHead>
                      <TableHead className="text-white min-w-[120px]">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tuitions.map((tuition) => (
                      <TableRow key={tuition.id} className="border-slate-600">
                        <TableCell className="text-white">{tuition.id}</TableCell>
                        <TableCell className="text-white">{tuition.student}</TableCell>
                        <TableCell className="font-semibold text-white">{formatVND(tuition.amount)}</TableCell>
                        <TableCell className="text-white">{tuition.term}</TableCell>
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
                        <TableCell className="text-white">{tuition.due_date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}