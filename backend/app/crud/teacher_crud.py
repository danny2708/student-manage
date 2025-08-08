from sqlalchemy.orm import Session
from app.models.teacher_model import Teacher
from app.schemas.teacher_schema import TeacherUpdate
from app.schemas.user_role import TeacherCreateWithUser, RoleCreate
from app.crud.user_crud import create_user
from app.models.user_model import User
from app.models.role_model import Role


def get_teacher(db: Session, teacher_id: int):
    """Lấy thông tin giáo viên theo ID."""
    return db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()


def get_teacher_by_user_id(db: Session, user_id: int):
    """Lấy thông tin giáo viên theo user_id."""
    return db.query(Teacher).filter(Teacher.user_id == user_id).first()


def get_teacher_by_email(db: Session, email: str):
    """Lấy thông tin giáo viên theo email."""
    # Lấy thông tin user có email tương ứng
    user_with_email = db.query(User).filter(User.email == email).first()
    if user_with_email:
        # Nếu tìm thấy user, tìm teacher tương ứng
        return db.query(Teacher).filter(Teacher.user_id == user_with_email.user_id).first()
    return None


def get_all_teachers(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả giáo viên."""
    return db.query(Teacher).offset(skip).limit(limit).all()


def create_teacher(db: Session, teacher_in: TeacherCreateWithUser):
    """
    Tạo một user mới và sau đó tạo một teacher mới, liên kết với user đó.
    """
    # Tách dữ liệu user và teacher từ schema TeacherCreateWithUser
    user_data = {
        "username": teacher_in.username,
        "password": teacher_in.password,
        "fullname": teacher_in.fullname,
        "email": teacher_in.email,
        "phone": teacher_in.phone,
        "date_of_birth": teacher_in.date_of_birth,
        "gender": teacher_in.gender,
        "address": teacher_in.address
    }
    
    teacher_data = {
        "specialization": teacher_in.specialization,
        "degree": teacher_in.degree,
        "join_date": teacher_in.join_date,
    }
    
    # Tạo user mới và gán role 'teacher'
    new_user = create_user(
        db=db,
        user_in=user_data,
        roles=[RoleCreate(role_name="teacher")]
    )
    
    # Tạo teacher mới, liên kết với user_id vừa tạo
    db_teacher = Teacher(
        **teacher_data,
        user_id=new_user.user_id  # Liên kết teacher với user_id vừa tạo
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    
    return db_teacher


def update_teacher(db: Session, teacher_id: int, teacher_update: TeacherUpdate):
    """Cập nhật thông tin giáo viên."""
    db_teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if db_teacher:
        update_data = teacher_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_teacher, key, value)
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
    return db_teacher


def delete_teacher(db: Session, teacher_id: int):
    """Xóa một giáo viên."""
    db_teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if db_teacher:
        db.delete(db_teacher)
        db.commit()
    return db_teacher
