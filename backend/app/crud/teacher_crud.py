from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.teacher_model import Teacher
from app.schemas.teacher_schema import TeacherUpdate, TeacherCreate


def get_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo ID.
    """
    stmt = select(Teacher).where(Teacher.teacher_id == teacher_id)
    return db.execute(stmt).scalar_one_or_none()


def get_teacher_by_user_id(db: Session, user_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo user_id.
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


def get_all_teachers(db: Session, skip: int = 0, limit: int = 100) -> List[Teacher]:
    """
    Lấy danh sách tất cả giáo viên.
    """
    stmt = select(Teacher).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_teacher(db: Session, teacher_in: TeacherCreate) -> Teacher:
    """
    Tạo mới giáo viên, chỉ cần user_id. created_at sẽ được set tự động từ model.
    """
    db_teacher = Teacher(**teacher_in.model_dump(exclude_unset=True, exclude={"created_at"}))
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher


def update_teacher(db: Session, teacher_id: int, teacher_update: TeacherUpdate) -> Optional[Teacher]:
    """
    Cập nhật thông tin giáo viên.
    """
    db_teacher = get_teacher(db, teacher_id)
    if not db_teacher:
        return None

    update_data = teacher_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_teacher, key, value)

    db.commit()
    db.refresh(db_teacher)
    return db_teacher


def delete_teacher(db: Session, teacher_id: int) -> Optional[Teacher]:
    """
    Xóa một giáo viên và user liên quan.
    """
    db_teacher = get_teacher(db, teacher_id)
    if not db_teacher:
        return None

    from app.crud.user_crud import delete_user
    delete_user(db, db_teacher.user_id)

    db.delete(db_teacher)
    db.commit()
    return db_teacher
