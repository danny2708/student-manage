
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.association_tables import student_parent_association
from app.models.student_model import Student
from app.schemas.student_schema import StudentUpdate, StudentCreate
from app.models.association_tables import user_roles 
from app.models.parent_model import Parent
from app.models.user_model import User

def get_student(db: Session, student_id: int) -> Optional[Student]:
    stmt = select(Student).where(Student.student_id == student_id)
    return db.execute(stmt).scalar_one_or_none()

def get_student_and_user_by_id(db: Session, student_id: int) -> Optional[Tuple[Student, User]]:
    """
    Tìm một sinh viên và thông tin người dùng liên quan bằng ID của họ.
    Hàm này thực hiện JOIN để lấy cả hai đối tượng.
    """
    # Thực hiện JOIN với bảng User để lấy cả hai đối tượng
    stmt = select(Student, User).join(User, User.user_id == Student.user_id).where(Student.student_id == student_id)
    # .first() sẽ trả về một tuple (Student, User) hoặc None nếu không tìm thấy
    return db.execute(stmt).first()

def get_student_with_user(db: Session, student_id: int):
    """
    Lấy học sinh kèm thông tin user (full_name, email,...)
    """
    stmt = (
        select(Student, User)
        .join(User, Student.user_id == User.user_id)
        .where(Student.student_id == student_id)
    )
    result = db.execute(stmt).first()
    if result:
        student, user = result
        return student, user
    return None, None

def get_parents_by_student_id(db: Session, student_id: int):
    """
    Lấy danh sách các phụ huynh liên kết với một sinh viên bằng ID của sinh viên đó.
    Đồng thời lấy thông tin người dùng của phụ huynh để có full_name.
    """
    # Thực hiện truy vấn JOIN giữa bảng Student, bảng liên kết, bảng Parent và bảng User
    # để lấy tất cả các phụ huynh và thông tin người dùng của họ.
    stmt = select(Parent, User).join(
        student_parent_association,
        student_parent_association.c.parent_id == Parent.parent_id
    ).join(
        User, User.user_id == Parent.user_id
    ).where(
        student_parent_association.c.student_id == student_id
    )
    # .all() sẽ trả về danh sách các tuple (Parent, User)
    return db.execute(stmt).all()

def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    stmt = select(Student).where(Student.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_students_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100) -> List[Student]:
    stmt = select(Student).where(Student.class_id == class_id).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
    stmt = select(Student).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_parents_by_student_id(db: Session, student_id: int):
    """
    Lấy danh sách các phụ huynh liên kết với một sinh viên bằng ID của sinh viên đó.
    Đồng thời lấy thông tin người dùng của phụ huynh để có full_name.
    """
    # Thực hiện truy vấn JOIN giữa bảng Student, bảng liên kết, bảng Parent và bảng User
    # để lấy tất cả các phụ huynh và thông tin người dùng của họ.
    return db.query(Parent, User).join(
        student_parent_association,
        student_parent_association.c.parent_id == Parent.parent_id
    ).join(
        User, User.user_id == Parent.user_id
    ).filter(
        student_parent_association.c.student_id == student_id
    ).all()


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

