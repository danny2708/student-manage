# app/crud/teacher_crud.py
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.models.role_model import Role 
from app.models.teacher_model import Teacher
from app.schemas.teacher_schema import TeacherUpdate, TeacherCreate, ClassTaught, TeacherStats
from app.models.association_tables import user_roles
from app.models.class_model import Class
from app.models.enrollment_model import Enrollment
from app.models.user_model import User
from app.models.subject_model import Subject
from app.models.teacher_review_model import TeacherReview
from app.models.schedule_model import Schedule

def get_teacher(db: Session, teacher_user_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo teacher_id.
    """
    stmt = select(Teacher).where(Teacher.user_id == teacher_user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_all_teachers(db: Session):
    return db.query(Teacher).all()

def get_teacher_by_user_id(db: Session, teacher_user_id: int) -> Optional[Teacher]:
    """
    Lấy thông tin giáo viên theo user_id (khóa ngoại đến User).
    """
    stmt = select(Teacher).where(Teacher.user_id == teacher_user_id)
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
    return [s for s in students]

def get_classes_taught_by_teacher(db: Session, teacher_user_id: int, month: int, year: int):
    return db.query(Class).filter(
        Class.teacher_user_id == teacher_user_id,
    ).all()

def get_all_teachers(db: Session, skip: int = 0, limit: int = 100) -> List[Teacher]:
    """
    Lấy danh sách tất cả giáo viên.
    """
    stmt = select(Teacher).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_teacher_base_salary(db: Session, teacher_user_id: int):
    from app.models import Teacher
    teacher = db.query(Teacher).filter(Teacher.user_id == teacher_user_id).first()
    return teacher.base_salary_per_class if teacher else 0.0

def get_teacher_reward_bonus(db: Session, teacher_user_id: int):
    from app.models import Teacher
    teacher = db.query(Teacher).filter(Teacher.user_id == teacher_user_id).first()
    return teacher.reward_bonus if teacher else 0.0

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


def get_class_taught(db: Session, teacher_user_id: int) -> List[ClassTaught]:
    """
    Lấy danh sách các lớp học mà một giáo viên phụ trách và trả về dưới dạng ClassTaught schema.
    """
    stmt = (
        select(
            Class.class_id,
            Class.teacher_user_id,
            Class.class_name,
            User.full_name.label("teacher_name"),
            Subject.name,
            Class.capacity,
            Class.fee
        )
        .join(User, Class.teacher_user_id == User.user_id)
        .join(Subject, Class.subject_id == Subject.subject_id)
        .where(Class.teacher_user_id == teacher_user_id)
    )
    
    result = db.execute(stmt).all()
    
    classes_taught_list = []
    for row in result:
        classes_taught_list.append(
            ClassTaught(
                teacher_user_id=row.teacher_user_id,
                class_id=row.class_id,
                class_name=row.class_name,
                teacher_name=row.teacher_name,
                subject_name=row.name,
                capacity=row.capacity,
                fee=row.fee
            )
        )
        
    return classes_taught_list

def get_teacher_stats(db: Session, teacher_user_id: int) -> Optional[TeacherStats]:
    """
    Lấy các số liệu thống kê cho giáo viên bao gồm: số lớp đã dạy, số lịch trình, số đánh giá và điểm trung bình.
    """
    # 1. Số lớp đã dạy
    class_taught_count = db.query(Class).filter(Class.teacher_user_id == teacher_user_id).count()

    # 2. Số lịch trình (đã được sửa để join với bảng schedules)
    schedules_count = (
        db.query(func.count(Schedule.schedule_id))
        .join(Class)
        .filter(Class.teacher_user_id == teacher_user_id)
        .scalar()
    ) or 0

    # 3. Số đánh giá
    reviews_count = db.query(func.count(TeacherReview.review_id)).filter(TeacherReview.teacher_user_id == teacher_user_id).scalar() or 0

    # 4. Điểm trung bình
    average_rate = db.query(func.avg(TeacherReview.rating)).filter(TeacherReview.teacher_user_id == teacher_user_id).scalar()
    rate_value = round(average_rate, 2) if average_rate is not None else 0.0

    return TeacherStats(
        class_taught=class_taught_count,
        schedules=schedules_count,
        reviews=reviews_count,
        rate=rate_value
    )
