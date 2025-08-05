from fastapi import APIRouter

# Import trực tiếp từng router từ các tệp của chúng
from app.api.v1.endpoints.user_route import router as user_router
from app.api.v1.endpoints.staff_route import router as staff_router
from app.api.v1.endpoints.manager_route import router as manager_router
from app.api.v1.endpoints.payroll_route import router as payroll_router
from app.api.v1.endpoints.teacher_route import router as teacher_router
from app.api.v1.endpoints.parent_route import router as parent_router
from app.api.v1.endpoints.student_route import router as student_router
from app.api.v1.endpoints.student_parent_route import router as student_parent_router
from app.api.v1.endpoints.subject_route import router as subject_router
from app.api.v1.endpoints.score_route import router as score_router
from app.api.v1.endpoints.tuition_route import router as tuition_router
from app.api.v1.endpoints.student_class_route import router as student_class_router
from app.api.v1.endpoints.class_route import router as class_router
from app.api.v1.endpoints.enrollment_route import router as enrollment_router
from app.api.v1.endpoints.attendance_route import router as attendance_router
from app.api.v1.endpoints.evaluation_route import router as evaluation_router
from app.api.v1.endpoints.schedule_route import router as schedule_router
from app.api.v1.endpoints.teacher_point_route import router as teacher_point_router
from app.api.v1.endpoints.notification_route import router as notification_router


api_router = APIRouter()

# Bao gồm các router riêng lẻ vào router chính của API v1
api_router.include_router(user_router, prefix="/users", tags=["Users"])
api_router.include_router(staff_router, prefix="/staff", tags=["Staff"])
api_router.include_router(manager_router, prefix="/managers", tags=["Managers"])
api_router.include_router(payroll_router, prefix="/payrolls", tags=["Payrolls"])
api_router.include_router(teacher_router, prefix="/teachers", tags=["Teachers"])
api_router.include_router(parent_router, prefix="/parents", tags=["Parents"])
api_router.include_router(student_router, prefix="/students", tags=["Students"])
api_router.include_router(student_parent_router, prefix="/student_parents", tags=["Student-Parents"])
api_router.include_router(subject_router, prefix="/subjects", tags=["Subjects"])
api_router.include_router(score_router, prefix="/scores", tags=["Scores"])
api_router.include_router(tuition_router, prefix="/tuitions", tags=["Tuitions"])
api_router.include_router(student_class_router, prefix="/student_classes", tags=["Student Classes"])
api_router.include_router(class_router, prefix="/classes", tags=["Classes"])
api_router.include_router(enrollment_router, prefix="/enrollments", tags=["Enrollments"])
api_router.include_router(attendance_router, prefix="/attendances", tags=["Attendances"])
api_router.include_router(evaluation_router, prefix="/evaluations", tags=["Evaluations"])
api_router.include_router(schedule_router, prefix="/schedules", tags=["Schedules"])
api_router.include_router(teacher_point_router, prefix="/teacher_points", tags=["Teacher Points"])
api_router.include_router(notification_router, prefix="/notifications", tags=["Notifications"])

