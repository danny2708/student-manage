from sqlalchemy.orm import Session
from app.models import Payroll
from app.schemas.payroll_schema import PayrollCreate, PayrollUpdate
from app.models.class_model import Class

def create_payroll_record(db: Session, payroll_in: PayrollCreate):
    db_payroll = Payroll(**payroll_in.model_dump())
    db.add(db_payroll)
    db.commit()
    db.refresh(db_payroll)
    return db_payroll

def get_all_teachers(db: Session):
    from app.models import Teacher
    return db.query(Teacher)

def get_classes_taught_by_teacher(db: Session, teacher_id: int, month: int, year: int):
    """Lấy danh sách các lớp đã dạy bởi giáo viên trong tháng và năm."""
    return db.query(Class).filter(
        Class.teacher_id == teacher_id,
    ).all()

def get_teacher_base_salary(db: Session, teacher_id: int):
    from app.models import Teacher
    teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    return teacher.base_salary_per_class if teacher else 0.0

def get_teacher_reward_bonus(db: Session, teacher_id: int):
    from app.models import Teacher
    teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    return teacher.reward_bonus if teacher else 0.0

def get_all_payrolls(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Payroll).offset(skip).limit(limit).all()

def get_payroll(db: Session, payroll_id: int) -> Payroll | None:
    """
    Lấy một bản ghi payroll theo payroll_id.
    Trả về Payroll object hoặc None nếu không tìm thấy.
    """
    return db.query(Payroll).filter(Payroll.payroll_id == payroll_id).first()

def get_payrolls_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách bảng lương theo teacher_id."""
    return db.query(Payroll).filter(Payroll.teacher_id == teacher_id).offset(skip).limit(limit).all()

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