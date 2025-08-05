from sqlalchemy.orm import Session
from app.models.staff_model import Staff
from app.schemas.staff_schema import StaffCreate, StaffUpdate

def get_staff(db: Session, staff_id: int):
    """Lấy thông tin nhân viên theo ID."""
    return db.query(Staff).filter(Staff.staff_id == staff_id).first()

def get_staff_by_user_id(db: Session, user_id: int):
    """Lấy thông tin nhân viên theo user_id."""
    return db.query(Staff).filter(Staff.user_id == user_id).first()

def get_all_staff(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả nhân viên."""
    return db.query(Staff).offset(skip).limit(limit).all()

def create_staff(db: Session, staff: StaffCreate):
    """Tạo mới một nhân viên."""
    db_staff = Staff(**staff.model_dump())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def update_staff(db: Session, staff_id: int, staff_update: StaffUpdate):
    """Cập nhật thông tin nhân viên."""
    db_staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
    if db_staff:
        update_data = staff_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_staff, key, value)
        db.add(db_staff)
        db.commit()
        db.refresh(db_staff)
    return db_staff

def delete_staff(db: Session, staff_id: int):
    """Xóa một nhân viên."""
    db_staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
    if db_staff:
        db.delete(db_staff)
        db.commit()
    return db_staff

