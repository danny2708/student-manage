from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select  # Import select statement

from app.models.student_model import Student
from app.schemas.student_schema import StudentUpdate
from app.schemas.user_role_schema import StudentCreateWithUser


def get_student(db: Session, student_id: int) -> Optional[Student]:
    """
    Lấy thông tin học sinh theo ID.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Student).where(Student.student_id == student_id)
    return db.execute(stmt).scalars().first()


def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    """
    Lấy thông tin học sinh theo user_id.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Student).where(Student.user_id == user_id)
    return db.execute(stmt).scalars().first()


def get_students_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100) -> List[Student]:
    """
    Lấy danh sách học sinh theo class_id.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Student).where(Student.class_id == class_id).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
    """
    Lấy danh sách tất cả học sinh.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Student).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_student(db: Session, student_in: StudentCreateWithUser) -> Student:
    """
    Tạo một user mới và sau đó tạo một student mới, liên kết với user đó.
    Lệnh import 'create_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    from app.crud.user_crud import create_user
    from app.models.user_model import User
    
    # Tạo user mới
    new_user = User(
        username=student_in.username,
        hashed_password=student_in.password,
        role="student"
    )
    db_user = create_user(db=db, user=new_user)
    
    # Tạo student mới, liên kết với user_id vừa tạo
    db_student = Student(
        fullname=student_in.fullname,
        phone_number=student_in.phone_number,
        email=student_in.email,
        date_of_birth=student_in.date_of_birth,
        gender=student_in.gender,
        address=student_in.address,
        class_id=student_in.class_id,
        enrollment_date=student_in.enrollment_date,
        user_id=db_user.user_id  # Liên kết student với user_id vừa tạo
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    return db_student


def update_student(db: Session, student_id: int, student_update: StudentUpdate) -> Optional[Student]:
    """
    Cập nhật thông tin học sinh.
    Sử dụng hàm get_student để tìm học sinh cần cập nhật.
    """
    db_student = get_student(db, student_id)
    if db_student:
        update_data = student_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student, key, value)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int) -> Optional[Student]:
    """
    Xóa một học sinh và người dùng liên quan.
    Lệnh import 'delete_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    db_student = get_student(db, student_id)
    if db_student:
        # Xóa cả user liên quan
        from app.crud.user_crud import delete_user
        delete_user(db, db_student.user_id)
        
        db.delete(db_student)
        db.commit()
    return db_student
