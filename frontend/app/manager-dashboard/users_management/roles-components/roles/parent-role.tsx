"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { useTuitions } from "../../../../../src/hooks/useTuition";
import { useParents } from "../../../../../src/hooks/useParent";

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
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function ParentRole({ user }: ParentRoleProps) {
  const { tuitions, fetchTuitionsByParentId, loading: tuitionLoading } = useTuitions();
  const { children, fetchParentChildren, loading: parentLoading, error: parentError } = useParents();

  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const parentId = user.user_id;
      await Promise.all([
        fetchParentChildren(parentId),
        fetchTuitionsByParentId(parentId),
      ]);
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

  const totalOwed = tuitions
    .filter((t) => t.status !== "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const overdueCount = tuitions.filter((t) => t.status === "overdue").length;

  const isLoading = loading || tuitionLoading || parentLoading;

  return (
    <div className="space-y-6 text-white">
      {/* Error Message */}
      {error || parentError ? (
        <div className="bg-red-800 text-red-200 p-3 rounded-lg">
          {error || parentError}
        </div>
      ) : null}

      {/* CARD TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Total Owed", "Overdue Payments", "Children", "Total Tuitions"].map(
          (title, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-slate-700 border-slate-600 min-w-[250px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    {title}
                  </CardTitle>
                  {index === 0 && (
                    <DollarSign className="h-4 w-4 text-slate-300" />
                  )}
                  {index === 1 && (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  {index === 2 && (
                    <Users className="h-4 w-4 text-slate-300" />
                  )}
                  {index === 3 && (
                    <Calendar className="h-4 w-4 text-slate-300" />
                  )}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-24 bg-slate-500 animate-pulse rounded"></div>
                  ) : (
                    <div
                      className={`text-3xl font-bold ${
                        index === 0 || index === 1
                          ? "text-red-400"
                          : "text-white"
                      }`}
                    >
                      {index === 0 && formatVND(totalOwed)}
                      {index === 1 && overdueCount}
                      {index === 2 && children.length}
                      {index === 3 && tuitions.length}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        )}
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

        {/* Children Tab */}
        <TabsContent value="children" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">My Children</CardTitle>
              <CardDescription className="text-slate-300">
                Information about your children
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-full bg-slate-500 animate-pulse rounded"
                    ></div>
                  ))}
                </div>
              ) : children.length === 0 ? (
                <div className="text-slate-300">No children found.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-white min-w-[150px]">
                          Student Name
                        </TableHead>
                        <TableHead className="text-white min-w-[200px]">
                          Email
                        </TableHead>
                        <TableHead className="text-white min-w-[100px]">
                          Gender
                        </TableHead>
                        <TableHead className="text-white min-w-[120px]">
                          Date of Birth
                        </TableHead>
                        <TableHead className="text-white min-w-[130px]">
                          Phone Number
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {children.map((child, index) => (
                        <TableRow key={index} className="border-slate-600">
                          <TableCell className="font-medium text-white">
                            {child.name}
                          </TableCell>
                          <TableCell className="text-white">
                            {child.email}
                          </TableCell>
                          <TableCell className="text-white">
                            {child.gender}
                          </TableCell>
                          <TableCell className="text-white">
                            {child.date_of_birth}
                          </TableCell>
                          <TableCell className="text-white">
                            {child.phone_number}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tuitions Tab */}
        <TabsContent value="tuitions" className="space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Tuition Information</CardTitle>
              <CardDescription className="text-slate-300">
                Payment history and upcoming dues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-full bg-slate-500 animate-pulse rounded"
                    ></div>
                  ))}
                </div>
              ) : tuitions.length === 0 ? (
                <div className="text-slate-300">No tuition records found.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-white min-w-[60px]">
                          ID
                        </TableHead>
                        <TableHead className="text-white min-w-[150px]">
                          Student
                        </TableHead>
                        <TableHead className="text-white min-w-[180px]">
                          Amount
                        </TableHead>
                        <TableHead className="text-white min-w-[120px]">
                          Term
                        </TableHead>
                        <TableHead className="text-white min-w-[100px]">
                          Status
                        </TableHead>
                        <TableHead className="text-white min-w-[120px]">
                          Due Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tuitions.map((tuition) => (
                        <TableRow
                          key={tuition.id}
                          className="border-slate-600"
                        >
                          <TableCell className="text-white">
                            {tuition.id}
                          </TableCell>
                          <TableCell className="text-white">
                            {tuition.student}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            {formatVND(tuition.amount)}
                          </TableCell>
                          <TableCell className="text-white">
                            {tuition.term}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                tuition.status === "paid"
                                  ? "bg-green-500 text-white"
                                  : tuition.status === "overdue"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white" 
                              }
                            >
                              {tuition.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {tuition.due_date}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
