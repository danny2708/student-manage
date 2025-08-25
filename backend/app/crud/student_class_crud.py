# backend/app/crud/student_class_rud.py
from typing import List, Optional
from sqlalchemy import select, insert, update
from sqlalchemy.orm import Session
from app.models.association_tables import student_class_association, EnrollmentStatus
from app.schemas.student_class_association_schema import StudentClassAssociationCreate
from app.models.enrollment_model import Enrollment
from datetime import datetime

# Các hàm CRUD sẽ được cập nhật để làm việc với bảng 'enrollments'
# và bảng 'student_class_association'

def get_enrollment(db: Session, student_id: int, class_id: int) -> Optional[dict]:
    """Lấy bản ghi enrollment dựa trên student_id và class_id."""
    # Tìm kiếm trong bảng enrollments
    stmt = (
        select(Enrollment)
        .where(
            Enrollment.student_id == student_id,
            Enrollment.class_id == class_id
        )
    )
    result = db.execute(stmt).scalars().first()
    return result

def get_enrollments_by_student_id(
    db: Session, student_id: int, skip: int = 0, limit: int = 100
) -> List[Enrollment]:
    """Lấy danh sách enrollments theo student_id."""
    stmt = (
        select(Enrollment)
        .where(Enrollment.student_id == student_id)
        .offset(skip)
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()

def get_enrollments_by_class_id(
    db: Session, class_id: int, skip: int = 0, limit: int = 100
) -> List[Enrollment]:
    """Lấy danh sách enrollments theo class_id."""
    stmt = (
        select(Enrollment)
        .where(Enrollment.class_id == class_id)
        .offset(skip)
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()

def get_all_enrollments(db: Session, skip: int = 0, limit: int = 100) -> List[Enrollment]:
    """Lấy danh sách tất cả các enrollments."""
    stmt = select(Enrollment).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_enrollment(db: Session, student_class_in: StudentClassAssociationCreate) -> Enrollment:
    """Tạo mới một bản ghi enrollment và một liên kết trong bảng student_class_association."""
    
    # 1. Thêm bản ghi vào bảng student_class_association (chỉ lưu cặp khóa)
    assoc_stmt = insert(student_class_association).values(
        student_id=student_class_in.student_id,
        class_id=student_class_in.class_id
    )
    db.execute(assoc_stmt)
    
    # 2. Thêm bản ghi vào bảng enrollments với trạng thái Active và thời gian hiện tại
    db_enrollment = Enrollment(
        student_id=student_class_in.student_id,
        class_id=student_class_in.class_id,
        enrollment_status=EnrollmentStatus.Active.value # Đã sửa thành giá trị chuỗi của enum
    )
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

def set_enrollment_inactive(db: Session, student_id: int, class_id: int) -> Optional[Enrollment]:
    """Cập nhật trạng thái enrollment thành Inactive."""
    # Kiểm tra xem bản ghi có tồn tại không
    db_enrollment = get_enrollment(db, student_id, class_id)
    if not db_enrollment:
        return None

    # Cập nhật trạng thái trong bảng enrollments
    db_enrollment.enrollment_status = EnrollmentStatus.Inactive.value # Đã sửa thành giá trị chuỗi của enum
    db.commit()
    db.refresh(db_enrollment)

    # Xóa bản ghi trong bảng student_class_association
    assoc_stmt = (
        student_class_association.delete()
        .where(
            student_class_association.c.student_id == student_id,
            student_class_association.c.class_id == class_id
        )
    )
    db.execute(assoc_stmt)
    db.commit()

    return db_enrollment

def update_enrollment(
    db: Session, student_id: int, class_id: int, enrollment_update: dict
) -> Optional[Enrollment]:
    """Cập nhật thông tin của một enrollment cụ thể."""
    db_enrollment = get_enrollment(db, student_id, class_id)
    if db_enrollment:
        for key, value in enrollment_update.items():
            setattr(db_enrollment, key, value)
        db.commit()
        db.refresh(db_enrollment)
    return db_enrollment
