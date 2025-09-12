// Mock data
export const mockUserAccount = {
    username: "Admin 1",
    role: "Manager",
    user_id: 1,
    fullName: "Nguyễn Văn A",
    email: "admin1@example.com",
    gender: "Male",
    dob: "01/01/1990",
    phone: "0987654321",
};

export const mockUsers = [
    { user_id: 1, username: "danny", role: "teacher", fullName: "Nguyễn Văn A", email: "a@gmail.com" },
    { user_id: 2, username: "benny", role: "student", fullName: "Nguyễn Văn B", email: "b@gmail.com" },
    { user_id: 3, username: "cedric", role: "student", fullName: "Nguyễn Văn C", email: "c@gmail.com" },
    { user_id: 4, username: "dave", role: "parent", fullName: "Nguyễn Văn D", email: "d@gmail.com" },
    { user_id: 5, username: "eve", role: "manager", fullName: "Nguyễn Văn E", email: "e@gmail.com" },
    { user_id: 6, username: "frank", role: "", fullName: "Nguyễn Văn F", email: "f@gmail.com" },
]

export const mockTuitions = [
    {
        tuiton_id: 1,
        studentName: "Nguyễn Văn B",
        className: "1A1",
        amount: 500000,
        status: "paid",
        dueDate: "2024-01-15",
    },
    {
        tuiton_id: 2,
        studentName: "Nguyễn Văn C",
        className: "1A2",
        amount: 500000,
        status: "pending",
        dueDate: "2024-01-15",
    },
    {
        tuiton_id: 3,
        studentName: "Nguyễn Văn G",
        className: "1A3",
        amount: 500000,
        status: "overdue",
        dueDate: "2024-01-15",
    },
]

export const mockSchedules = [
    {
        schedule_id: 1,
        class: "1A1",
        day: "Monday",
        room: "101",
        date: "08/09/2025",
        type: "Weekly",
        start: "20:00",
        end: "22:00",
    },
    {
        schedule_id: 2,
        class: "1A2",
        day: "Tuesday",
        room: "102",
        date: "09/09/2025",
        type: "Once",
        start: "18:00",
        end: "20:00",
    },
    {
        schedule_id: 3,
        class: "1A3",
        day: "Wednesday",
        room: "103",
        date: "10/09/2025",
        type: "Weekly",
        start: "19:00",
        end: "21:00",
    },
]

export const mockPayrolls = [
    {
        payroll_id: 1,
        teacherName: "Nguyễn Văn A",
        baseSalary: 5000000,
        bonus: 500000,
        total: 5500000,
        status: "paid",
        sentAt: "2024-01-01",
    },
    {
        payroll_id: 2,
        teacherName: "Nguyễn Văn B",
        baseSalary: 4500000,
        bonus: 300000,
        total: 4800000,
        status: "pending",
        sentAt: "2024-01-01",
    },
]

export const mockTeacherReviews = [
    {
        review_id: 1,
        teacher: "Nguyễn Văn A",
        student: "Nguyễn Văn B",
        rating: 5,
        review: "Teacher is so handsome and professional",
    },
    { review_id: 2, teacher: "Nguyễn Văn A", student: "Nguyễn Văn C", rating: 4, review: "Great teaching methods" },
]

export const mockEvaluations = [
    { evaluation_id: 1, student: "Nguyễn Văn B", teacher: "Nguyễn Văn A", type: "discipline", date: "2024-01-15" },
    { evaluation_id: 2, student: "Nguyễn Văn C", teacher: "Nguyễn Văn A", type: "study", date: "2024-01-16" },
]

export const mockClasses = [
    { class_id: 1, name: "Class H-1", teacher: "Teacher Andy", subject: "English", capacity: 30, fee: 1500000 ,studentCount: 28, subjects: Math},
    { class_id: 2, name: "Class H-2", teacher: "Teacher Andy", subject: "Math", capacity: 25, fee: 1500000, studentCount: 25, subjects: Math },
    { class_id: 3, name: "Class H-3", teacher: "Teacher Andy", subject: "Physics", capacity: 30, fee: 1500000, studentCount: 28, subjects: Math },
]

export const mockSubjects = [
    { subject_id: 1, subject: "English", classes: 20 },
    { subject_id: 2, subject: "Math", classes: 40 },
    { subject_id: 3, subject: "Physics", classes: 50 },
]