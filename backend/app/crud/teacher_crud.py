# app/crud/teacher_crud.py
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.role_model import Role 
from app.models.teacher_model import Teacher
from app.schemas.teacher_schema import TeacherUpdate, TeacherCreate
from app.models.association_tables import user_roles
from app.models.class_model import Class
from app.models.enrollment_model import Enrollment 

def get_teacher(db: Session, user_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo teacher_id.
    """
    stmt = select(Teacher).where(Teacher.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_teacher_by_user_id(db: Session, user_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo user_id (khóa ngoại đến User).
    """
    stmt = select(Teacher).where(Teacher.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def get_teacher_by_email(db: Session, email: str) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo email.
    """
    from app.models.user_model import User

    stmt_user = select(User).where(User.email == email)
    user_with_email = db.execute(stmt_user).scalar_one_or_none()

    if user_with_email:
        stmt_teacher = select(Teacher).where(Teacher.user_id == user_with_email.user_id)
        return db.execute(stmt_teacher).scalar_one_or_none()

    return None

def get_students(db: Session, teacher_user_id: int):
    """
    Lấy danh sách student_user_id mà teacher quản lý.
    """
    students = (
        db.query(Enrollment.student_user_id)
        .join(Class, Enrollment.class_id == Class.class_id)
        .filter(Class.teacher_user_id == teacher_user_id)
        .all()
    )
    return [s.student_user_id for s in students]

def get_all_teachers(db: Session, skip: int = 0, limit: int = 100) -> List[Teacher]:
    """
    Lấy danh sách tất cả giáo viên.
    """
    stmt = select(Teacher).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_teacher(db: Session, teacher_in: TeacherCreate) -> Teacher:
    """
    Tạo mới giáo viên.
    """
    db_teacher = Teacher(**teacher_in.model_dump(exclude_unset=True))
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher


def update_teacher(db: Session, user_id: int, teacher_update: TeacherUpdate) -> Optional[Teacher]:
    """
    Cập nhật thông tin giáo viên.
    """
    db_teacher = get_teacher(db, user_id)
    if not db_teacher:
        return None

    update_data = teacher_update.model_dump(exclude_unset=True, exclude={"user_id"})
    for key, value in update_data.items():
        setattr(db_teacher, key, value)

    db.commit()
    db.refresh(db_teacher)
    return db_teacher


def delete_teacher(db: Session, user_id: int):
    db_teacher = get_teacher(db, user_id=user_id)
    if not db_teacher:
        return None

    # Lấy role "teacher"
    teacher_role = db.query(Role).filter(Role.name == "teacher").first()
    if not teacher_role:
        return None

    # Xóa chỉ role "teacher" cho user này
    db.execute(
        user_roles.delete()
        .where(user_roles.c.user_id == db_teacher.user_id)
        .where(user_roles.c.role_id == teacher_role.role_id)
    )

    db.delete(db_teacher)
    db.commit()
    return db_teacher
