from sqlalchemy.orm import Session
from app.models.staff_model import Staff
from app.schemas.staff_schema import StaffUpdate
from app.schemas.user_role import StaffCreateWithUser, RoleCreate
from app.crud.user_crud import create_user
from app.models.user_model import User
from app.models.role_model import Role

# Lấy một nhân viên theo ID
def get_staff(db: Session, staff_id: int):
    """Lấy thông tin nhân viên theo ID."""
    return db.query(Staff).filter(Staff.staff_id == staff_id).first()

# Lấy một nhân viên theo User ID
def get_staff_by_user_id(db: Session, user_id: int):
    """Lấy thông tin nhân viên theo user_id."""
    return db.query(Staff).filter(Staff.user_id == user_id).first()

# Lấy tất cả nhân viên
def get_all_staff(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả nhân viên."""
    return db.query(Staff).offset(skip).limit(limit).all()

# Tạo một nhân viên mới và một user tương ứng
def create_staff(db: Session, staff_in: StaffCreateWithUser):
    """
    Tạo một user mới và sau đó tạo một staff mới, liên kết với user đó.
    Dữ liệu được tách từ StaffCreateWithUser schema.
    """
    # 1. Tách dữ liệu user và staff từ schema StaffCreateWithUser
    user_data = {
        "username": staff_in.username,
        "password": staff_in.password,
        "fullname": staff_in.fullname,
        "email": staff_in.email,
        "phone": staff_in.phone,
        "date_of_birth": staff_in.date_of_birth,
        "gender": staff_in.gender,
        "address": staff_in.address
    }
    
    staff_data = {
        "position": staff_in.position,
        "hire_date": staff_in.hire_date,
    }
    
    # 2. Tạo user mới và gán role 'staff'
    new_user = create_user(
        db=db,
        user_in=user_data,
        roles=[RoleCreate(role_name="staff")]
    )
    
    # 3. Tạo staff mới, liên kết với user_id vừa tạo
    db_staff = Staff(
        **staff_data,
        user_id=new_user.user_id  # Liên kết staff với user_id vừa tạo
    )
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    
    return db_staff

# Cập nhật thông tin nhân viên
def update_staff(db: Session, staff_id: int, staff_update: StaffUpdate):
    """Cập nhật thông tin nhân viên."""
    db_staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
    if db_staff:
        # Cập nhật các trường từ staff_update, bỏ qua các trường không được đặt
        update_data = staff_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_staff, key, value)
        
        db.add(db_staff)
        db.commit()
        db.refresh(db_staff)
    return db_staff

# Xóa một nhân viên
def delete_staff(db: Session, staff_id: int):
    """Xóa một nhân viên."""
    db_staff = db.query(Staff).filter(Staff.staff_id == staff_id).first()
    if db_staff:
        db.delete(db_staff)
        db.commit()
    return db_staff
