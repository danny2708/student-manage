from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user_model import User
from app.schemas.user_schema import UserBase
from app.schemas.staff_schema import Staff, StaffUpdate
from app.models.staff_model import Staff as StaffModel

def create_staff(db: Session, staff: Staff) -> Staff:
    """
    Creates a new staff member.
    """
    # Import create_user here to avoid circular import
    from app.crud.user_crud import create_user 
    
    # Tạo người dùng trước
    user = User(
        username=staff.username,
        hashed_password=staff.password,
        role="staff"
    )
    db_user = create_user(db, user)

    # Sau đó tạo staff
    db_staff = StaffModel(
        user_id=db_user.user_id,
        fullname=staff.fullname,
        phone_number=staff.phone_number
    )
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def get_staff(db: Session, staff_id: int) -> Optional[Staff]:
    """
    Get a staff member by ID.
    """
    stmt = select(StaffModel).where(StaffModel.staff_id == staff_id)
    return db.execute(stmt).scalars().first()

def get_staff_by_user_id(db: Session, user_id: int) -> Optional[Staff]:
    """
    Get a staff member by user ID.
    """
    stmt = select(StaffModel).where(StaffModel.user_id == user_id)
    return db.execute(stmt).scalars().first()

def get_all_staff(db: Session, skip: int = 0, limit: int = 100) -> List[Staff]:
    """
    Get all staff members with pagination.
    """
    stmt = select(StaffModel).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def update_staff(db: Session, staff_id: int, staff_update: StaffUpdate) -> Optional[Staff]:
    """
    Update a staff member's information.
    """
    db_staff = get_staff(db, staff_id)
    if db_staff:
        for key, value in staff_update.model_dump(exclude_unset=True).items():
            setattr(db_staff, key, value)
        db.commit()
        db.refresh(db_staff)
    return db_staff

def delete_staff(db: Session, staff_id: int) -> Optional[Staff]:
    """
    Delete a staff member.
    """
    db_staff = get_staff(db, staff_id)
    if db_staff:
        # Also delete the associated user
        from app.crud.user_crud import delete_user
        delete_user(db, db_staff.user_id)
        
        db.delete(db_staff)
        db.commit()
    return db_staff
