from sqlalchemy.orm import Session
from app.models.payroll_model import Payroll
from app.schemas.payroll_schema import PayrollCreate, PayrollUpdate

def get_payroll(db: Session, payroll_id: int):
    """Lấy thông tin bảng lương theo ID."""
    return db.query(Payroll).filter(Payroll.payroll_id == payroll_id).first()

def get_payrolls_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách bảng lương theo user_id."""
    return db.query(Payroll).filter(Payroll.user_id == user_id).offset(skip).limit(limit).all()

def get_all_payrolls(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả bảng lương."""
    return db.query(Payroll).offset(skip).limit(limit).all()

def create_payroll(db: Session, payroll: PayrollCreate):
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

