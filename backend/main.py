from fastapi import FastAPI
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
from app.database import Base, engine # Import Base và engine để tạo bảng

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="Hệ thống quản lý học sinh",
    description="API cho các chức năng quản lý học sinh, giáo viên, phụ huynh và các hoạt động liên quan.",
    version="1.0.0",
)

# Tạo tất cả các bảng trong cơ sở dữ liệu khi ứng dụng khởi động
# Trong môi trường sản xuất, bạn nên sử dụng Alembic để quản lý migrations
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Bao gồm các router API
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(staff.router, prefix="/api/v1/staff", tags=["Staff"])
app.include_router(managers.router, prefix="/api/v1/managers", tags=["Managers"])
app.include_router(payrolls.router, prefix="/api/v1/payrolls", tags=["Payrolls"])
app.include_router(teachers.router, prefix="/api/v1/teachers", tags=["Teachers"])
app.include_router(parents.router, prefix="/api/v1/parents", tags=["Parents"])
app.include_router(students.router, prefix="/api/v1/students", tags=["Students"])
app.include_router(student_parents.router, prefix="/api/v1/student_parents", tags=["Student-Parents"])
app.include_router(subjects.router, prefix="/api/v1/subjects", tags=["Subjects"])
app.include_router(scores.router, prefix="/api/v1/scores", tags=["Scores"])
app.include_router(tuitions.router, prefix="/api/v1/tuitions", tags=["Tuitions"])
app.include_router(student_classes.router, prefix="/api/v1/student_classes", tags=["Student Classes"])
app.include_router(classes.router, prefix="/api/v1/classes", tags=["Classes"])
app.include_router(enrollments.router, prefix="/api/v1/enrollments", tags=["Enrollments"])
app.include_router(attendances.router, prefix="/api/v1/attendances", tags=["Attendances"])
app.include_router(evaluations.router, prefix="/api/v1/evaluations", tags=["Evaluations"])
app.include_router(schedules.router, prefix="/api/v1/schedules", tags=["Schedules"])
app.include_router(teacher_points.router, prefix="/api/v1/teacher_points", tags=["Teacher Points"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])


@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với Hệ thống quản lý học sinh!"}

