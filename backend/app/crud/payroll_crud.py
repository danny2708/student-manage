from sqlalchemy.orm import Session
from app.models.payroll_model import Payroll
from app.models.teacher_model import Teacher
from app.models.class_model import Class
from app.schemas.payroll_schema import PayrollCreate, PayrollUpdate
from datetime import datetime
from sqlalchemy import extract

def get_payroll(db: Session, payroll_id: int):
    """Lấy thông tin bảng lương theo ID."""
    return db.query(Payroll).filter(Payroll.payroll_id == payroll_id).first()

def get_payrolls_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách bảng lương theo teacher_id."""
    return db.query(Payroll).filter(Payroll.teacher_id == teacher_id).offset(skip).limit(limit).all()

def get_all_payrolls(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả bảng lương."""
    return db.query(Payroll).offset(skip).limit(limit).all()

def create_payroll_record(db: Session, payroll: PayrollCreate):
    """Tạo mới một bảng lương."""
    db_payroll = Payroll(**payroll.model_dump())
    db.add(db_payroll)
    db.commit()
    db.refresh(db_payroll)
    return db_payroll

def update_payroll(db: Session, payroll_id: int, payroll_update: PayrollUpdate):
    """Cập nhật thông tin bảng lương."""
    db_payroll = db.query(Payroll).filter(Payroll.payroll_id == payroll_id).first()
    if db_payroll:
        update_data = payroll_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_payroll, key, value)
        db.add(db_payroll)
        db.commit()
        db.refresh(db_payroll)
    return db_payroll

def delete_payroll(db: Session, payroll_id: int):
    """Xóa một bảng lương."""
    db_payroll = db.query(Payroll).filter(Payroll.payroll_id == payroll_id).first()
    if db_payroll:
        db.delete(db_payroll)
        db.commit()
    return db_payroll

# Các hàm cần thiết cho payroll_service.py
def get_all_teachers(db: Session):
    """Lấy tất cả giáo viên."""
    # Giả định bạn có một model Teacher
    return db.query(Teacher).all()

def get_classes_taught_by_teacher(db: Session, teacher_id: int, month: int, year: int):
    """Lấy danh sách các lớp đã dạy bởi giáo viên trong tháng và năm."""
    # Giả định bảng Class có teacher_id và date_taught
    return db.query(Class).filter(
        Class.teacher_id == teacher_id,
        extract('month', Class.date_taught) == month,
        extract('year', Class.date_taught) == year
    ).all()

def get_teacher_base_salary(db: Session, teacher_id: int) -> float:
    """Lấy lương cơ bản trên mỗi lớp của giáo viên."""
    teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if teacher and hasattr(teacher, 'base_salary_per_class'):
        return teacher.base_salary_per_class
    return 0.0

def get_teacher_reward_bonus(db: Session, teacher_id: int) -> float:
    """Lấy tiền thưởng của giáo viên."""
    teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if teacher and hasattr(teacher, 'reward_bonus'):
        return teacher.reward_bonus
    return 0.0
