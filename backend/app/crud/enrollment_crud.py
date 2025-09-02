# backend/app/crud/student_class_crud.py
from typing import List, Optional
from sqlalchemy import select, insert, delete
from sqlalchemy.orm import Session
from app.schemas.enrollment_schema import EnrollmentCreate
from app.models.enrollment_model import Enrollment, EnrollmentStatus


def get_enrollment(db: Session, student_user_id: int, class_id: int) -> Optional[Enrollment]:
    """Lấy bản ghi enrollment dựa trên student_user_id và class_id."""
    stmt = (
        select(Enrollment)
        .where(
            Enrollment.student_user_id == student_user_id,
            Enrollment.class_id == class_id
        )
    )
    return db.execute(stmt).scalars().first()


def get_enrollments_by_student_user_id(
    db: Session, student_user_id: int, skip: int = 0, limit: int = 100
) -> List[Enrollment]:
    """Lấy danh sách enrollments theo student_user_id."""
    stmt = (
        select(Enrollment)
        .where(Enrollment.student_user_id == student_user_id)
        .offset(skip)
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()


def get_active_enrollments_by_class_id(
    db: Session, 
    class_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[Enrollment]:
    """
    Lấy danh sách enrollments đang active theo class_id.
    """
    stmt = (
        select(Enrollment)
        .where(
            Enrollment.class_id == class_id,
            Enrollment.enrollment_status == EnrollmentStatus.active # chỉ lấy học sinh đang học
        )
        .offset(skip)
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()


def get_all_enrollments(db: Session, skip: int = 0, limit: int = 100) -> List[Enrollment]:
    """Lấy danh sách tất cả các enrollments."""
    stmt = select(Enrollment).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_enrollment(db: Session, enrollment_in: EnrollmentCreate) -> Enrollment:
    """Tạo mới một bản ghi enrollment và một liên kết trong bảng student_class_association."""
    
    #  Thêm bản ghi vào bảng enrollments với trạng thái active
    db_enrollment = Enrollment(
        student_user_id=enrollment_in.student_user_id,
        class_id=enrollment_in.class_id,
        enrollment_date=enrollment_in.enrollment_date,
        status=EnrollmentStatus.active.value  # dùng giá trị enum
    )
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment


def set_enrollment_inactive(db: Session, student_user_id: int, class_id: int) -> Optional[Enrollment]:
    """Cập nhật trạng thái enrollment thành inactive."""
    db_enrollment = get_enrollment(db, student_user_id, class_id)
    if not db_enrollment:
        return None

    db_enrollment.enrollment_status = EnrollmentStatus.inactive.value
    db.commit()
    db.refresh(db_enrollment)

    return db_enrollment


def update_enrollment(
    db: Session, student_user_id: int, class_id: int, enrollment_update: dict
) -> Optional[Enrollment]:
    """Cập nhật thông tin của một enrollment cụ thể."""
    db_enrollment = get_enrollment(db, student_user_id, class_id)
    if db_enrollment:
        for key, value in enrollment_update.items():
            setattr(db_enrollment, key, value)
        db.commit()
        db.refresh(db_enrollment)
    return db_enrollment
