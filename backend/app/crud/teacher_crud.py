from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select # Import select statement

from app.models.teacher_model import Teacher
from app.schemas.teacher_schema import TeacherUpdate
from app.schemas.user_role_schema import TeacherCreateWithUser


def get_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo ID.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Teacher).where(Teacher.teacher_id == teacher_id)
    return db.execute(stmt).scalars().first()


def get_teacher_by_user_id(db: Session, user_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo user_id.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Teacher).where(Teacher.user_id == user_id)
    return db.execute(stmt).scalars().first()


def get_teacher_by_email(db: Session, email: str) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo email.
    Sử dụng cú pháp select() mới để tìm user và teacher.
    """
    from app.models.user_model import User
    
    # Lấy thông tin user có email tương ứng
    stmt_user = select(User).where(User.email == email)
    user_with_email = db.execute(stmt_user).scalars().first()

    if user_with_email:
        # Nếu tìm thấy user, tìm teacher tương ứng
        stmt_teacher = select(Teacher).where(Teacher.user_id == user_with_email.user_id)
        return db.execute(stmt_teacher).scalars().first()
    
    return None


def get_all_teachers(db: Session, skip: int = 0, limit: int = 100) -> List[Teacher]:
    """
    Lấy danh sách tất cả giáo viên.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Teacher).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_teacher(db: Session, teacher_in: TeacherCreateWithUser) -> Teacher:
    """
    Tạo một user mới và sau đó tạo một teacher mới, liên kết với user đó.
    Lệnh import 'create_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    from app.crud.user_crud import create_user
    from app.models.user_model import User

    # Tạo user mới
    new_user = User(
        username=teacher_in.username,
        hashed_password=teacher_in.password,
        role="teacher"
    )
    db_user = create_user(db=db, user=new_user)
    
    # Tạo teacher mới, liên kết với user_id vừa tạo
    db_teacher = Teacher(
        fullname=teacher_in.fullname,
        phone_number=teacher_in.phone_number,
        email=teacher_in.email,
        specialization=teacher_in.specialization,
        degree=teacher_in.degree,
        join_date=teacher_in.join_date,
        user_id=db_user.user_id  # Liên kết teacher với user_id vừa tạo
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    
    return db_teacher


def update_teacher(db: Session, teacher_id: int, teacher_update: TeacherUpdate) -> Optional[Teacher]:
    """
    Cập nhật thông tin giáo viên.
    Sử dụng cú pháp select() mới để tìm giáo viên.
    """
    db_teacher = get_teacher(db, teacher_id)
    if db_teacher:
        update_data = teacher_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_teacher, key, value)
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
    return db_teacher


def delete_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
    """
    Xóa một giáo viên và người dùng liên quan.
    Lệnh import 'delete_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    db_teacher = get_teacher(db, teacher_id)
    if db_teacher:
        # Xóa cả user liên quan
        from app.crud.user_crud import delete_user
        delete_user(db, db_teacher.user_id)
        
        db.delete(db_teacher)
        db.commit()
    return db_teacher
