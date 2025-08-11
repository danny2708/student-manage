from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.student_model import Student
from app.schemas.student_schema import StudentUpdate, StudentCreate
from app.models.association_tables import user_roles 

def get_student(db: Session, student_id: int) -> Optional[Student]:
    stmt = select(Student).where(Student.student_id == student_id)
    return db.execute(stmt).scalar_one_or_none()

def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    stmt = select(Student).where(Student.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_students_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100) -> List[Student]:
    stmt = select(Student).where(Student.class_id == class_id).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
    stmt = select(Student).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_student(db: Session, student_in: StudentCreate) -> Student:
    """
    Tạo mới học sinh, chỉ cần user_id. created_at sẽ được set tự động từ model.
    """
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
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int):
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if not db_student:
        return None
    # Lưu dữ liệu trước khi xóa
    deleted_data = db_student
    db.execute(
        user_roles.delete().where(user_roles.c.user_id == db_student.user_id)
    )
    db.delete(db_student)
    db.commit()
    return deleted_data

