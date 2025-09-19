"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table"
import { Badge } from "../../../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs"
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react"

// Mock data - replace with actual API calls
const mockChildren = [
  {
    student_name: "Emma Johnson",
    email: "emma.johnson@school.edu",
    gender: "Female",
    date_of_birth: "2008-05-15",
    phone_number: "(555) 123-4567",
  },
  {
    student_name: "Alex Johnson",
    email: "alex.johnson@school.edu",
    gender: "Male",
    date_of_birth: "2010-08-22",
    phone_number: "(555) 123-4568",
  },
]

const mockTuitions = [
  { id: 1, student: "Emma Johnson", amount: 2500, term: "Spring 2024", status: "Paid", due_date: "2024-01-15" },
  { id: 2, student: "Alex Johnson", amount: 2500, term: "Spring 2024", status: "Paid", due_date: "2024-01-15" },
  { id: 3, student: "Emma Johnson", amount: 2500, term: "Summer 2024", status: "Pending", due_date: "2024-05-15" },
  { id: 4, student: "Alex Johnson", amount: 2500, term: "Summer 2024", status: "Overdue", due_date: "2024-05-15" },
]

export function ParentRole() {
  const [children, setChildren] = useState(mockChildren)
  const [tuitions, setTuitions] = useState(mockTuitions)

  const totalOwed = tuitions.filter((t) => t.status !== "Paid").reduce((sum, t) => sum + t.amount, 0)

  const overdueCount = tuitions.filter((t) => t.status === "Overdue").length

  return (
    <div className="space-y-6">
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
                      <TableCell className="font-medium">{child.student_name}</TableCell>
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
                            tuition.status === "Paid"
                              ? "default"
                              : tuition.status === "Overdue"
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
  )
}
