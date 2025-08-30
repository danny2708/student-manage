from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.models.association_tables import student_parent_association, user_roles
from app.models.student_model import Student
from app.schemas.student_schema import StudentUpdate, StudentCreate
from app.models.parent_model import Parent
from app.models.user_model import User
from app.models.role_model import Role 

def get_student(db: Session, student_id: int) -> Optional[Student]:
    return db.execute(
        select(Student).where(Student.student_id == student_id)
    ).scalar_one_or_none()


def get_student_with_user(db: Session, student_id: int) -> Optional[Tuple[Student, User]]:
    """
    Lấy học sinh và user liên kết theo student_id.
    """
    result = db.execute(
        select(Student, User)
        .join(User, Student.user_id == User.user_id)
        .where(Student.student_id == student_id)
    ).first()
    return result if result else (None, None)


def get_parents_by_student_id(db: Session, student_id: int) -> List[Tuple[Parent, User]]:
    """
    Lấy danh sách phụ huynh và user liên kết với 1 student.
    """
    return db.execute(
        select(Parent, User)
        .join(student_parent_association, student_parent_association.c.parent_id == Parent.parent_id)
        .join(User, User.user_id == Parent.user_id)
        .where(student_parent_association.c.student_id == student_id)
    ).all()


def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    return db.execute(
        select(Student).where(Student.user_id == user_id)
    ).scalar_one_or_none()


def get_students_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100) -> List[Student]:
    return db.execute(
        select(Student).where(Student.class_id == class_id).offset(skip).limit(limit)
    ).scalars().all()


def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
    return db.execute(
        select(Student).offset(skip).limit(limit)
    ).scalars().all()


def create_student(db: Session, student_in: StudentCreate) -> Student:
    db_student = Student(**student_in.model_dump(exclude_unset=True, exclude={"created_at"}))
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def update_student(db: Session, student_id: int, student_update: StudentUpdate) -> Optional[Student]:
    db_student = get_student(db, student_id)
    if db_student:
        update_data = student_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student, key, value)
        db.commit()
        db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int):
    db_student = get_student(db, student_id=student_id)
    if not db_student:
        return None

    # Lấy role "student"
    student_role = db.query(Role).filter(Role.name == "student").first()
    if not student_role:
        return None

    # Xóa chỉ role "student" cho user này
    db.execute(
        user_roles.delete()
        .where(user_roles.c.user_id == db_student.user_id)
        .where(user_roles.c.role_id == student_role.role_id)
    )

    db.delete(db_student)
    db.commit()
    return db_student

