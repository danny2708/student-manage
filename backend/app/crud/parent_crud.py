from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.parent_model import Parent
from app.schemas.parent_schema import ParentCreate, ParentUpdate


def get_parent(db: Session, parent_id: int) -> Optional[Parent]:
    """
    Lấy thông tin phụ huynh theo ID.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Parent).where(Parent.parent_id == parent_id)
    return db.execute(stmt).scalars().first()


def get_parent_by_user_id(db: Session, user_id: int) -> Optional[Parent]:
    """
    Lấy thông tin phụ huynh theo user_id.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Parent).where(Parent.user_id == user_id)
    return db.execute(stmt).scalars().first()


def get_parent_by_email(db: Session, email: str) -> Optional[Parent]:
    """
    Lấy thông tin phụ huynh theo email.
    Sử dụng cú pháp select() mới để tìm user và parent.
    """
    from app.models.user_model import User

    # Lấy thông tin user có email tương ứng
    stmt_user = select(User).where(User.email == email)
    user_with_email = db.execute(stmt_user).scalars().first()

    if user_with_email:
        # Nếu tìm thấy user, tìm parent tương ứng
        stmt_parent = select(Parent).where(Parent.user_id == user_with_email.user_id)
        return db.execute(stmt_parent).scalars().first()

    return None


def get_all_parents(db: Session, skip: int = 0, limit: int = 100) -> List[Parent]:
    """
    Lấy danh sách tất cả phụ huynh.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Parent).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_parent(db: Session, parent_in: ParentCreate) -> Parent:
    """
    Tạo một user mới và sau đó tạo một parent mới, liên kết với user đó.
    Lệnh import 'create_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    from app.crud.user_crud import create_user
    from app.models.user_model import User
    
    # Tạo user mới
    new_user = User(
        username=parent_in.user_info.username,
        hashed_password=parent_in.user_info.password,
        role="parent"
    )
    db_user = create_user(db=db, user=new_user)

    # Tạo parent mới, liên kết với user_id vừa tạo
    db_parent = Parent(
        fullname=parent_in.user_info.fullname,
        phone_number=parent_in.user_info.phone_number,
        email=parent_in.user_info.email,
        relationship_to_student=parent_in.relationship_to_student,
        user_id=db_user.user_id  # Liên kết parent với user_id vừa tạo
    )

    db.add(db_parent)
    db.commit()
    db.refresh(db_parent)

    return db_parent


def update_parent(db: Session, parent_id: int, parent_update: ParentUpdate) -> Optional[Parent]:
    """
    Cập nhật thông tin phụ huynh.
    Sử dụng hàm get_parent để tìm phụ huynh cần cập nhật.
    """
    db_parent = get_parent(db, parent_id)
    if db_parent:
        update_data = parent_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_parent, key, value)
        db.add(db_parent)
        db.commit()
        db.refresh(db_parent)
    return db_parent


def delete_parent(db: Session, parent_id: int) -> Optional[Parent]:
    """
    Xóa một phụ huynh và người dùng liên quan.
    Lệnh import 'delete_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    db_parent = get_parent(db, parent_id)
    if db_parent:
        # Xóa cả user liên quan
        from app.crud.user_crud import delete_user
        delete_user(db, db_parent.user_id)
        
        db.delete(db_parent)
        db.commit()
    return db_parent
