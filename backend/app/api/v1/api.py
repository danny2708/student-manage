from fastapi import APIRouter
from app.api.v1.endpoints import (
    users,
    staff,
    managers,
    payrolls,
    teachers,
    parents,
    students,
    student_parents,
    subjects,
    scores,
    tuitions,
    student_classes,
    classes,
    enrollments,
    attendances,
    evaluations,
    schedules,
    teacher_points,
    notifications
)

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(staff.router, prefix="/staff", tags=["Staff"])
api_router.include_router(managers.router, prefix="/managers", tags=["Managers"])
api_router.include_router(payrolls.router, prefix="/payrolls", tags=["Payrolls"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["Teachers"])
api_router.include_router(parents.router, prefix="/parents", tags=["Parents"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(student_parents.router, prefix="/student_parents", tags=["Student-Parents"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])
api_router.include_router(scores.router, prefix="/scores", tags=["Scores"])
api_router.include_router(tuitions.router, prefix="/tuitions", tags=["Tuitions"])
api_router.include_router(student_classes.router, prefix="/student_classes", tags=["Student Classes"])
api_router.include_router(classes.router, prefix="/classes", tags=["Classes"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
api_router.include_router(attendances.router, prefix="/attendances", tags=["Attendances"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["Evaluations"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["Schedules"])
api_router.include_router(teacher_points.router, prefix="/teacher_points", tags=["Teacher Points"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

