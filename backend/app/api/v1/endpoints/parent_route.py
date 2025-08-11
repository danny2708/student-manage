# app/api/v1/endpoints/parent_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
# Import các CRUD operations và schemas trực tiếp
from app.crud import parent_crud, user_crud, user_role_crud
from app.schemas.user_role_schema import UserRoleCreate
from app.schemas import parent_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=parent_schema.Parent, status_code=status.HTTP_201_CREATED)
def assign_parent(parent_in: parent_schema.ParentAssign, db: Session = Depends(deps.get_db)):
    """
    Gán một user đã tồn tại thành parent + cập nhật role 'parent' trong user_roles.
    """
    # 1. Kiểm tra user có tồn tại
    db_user = user_crud.get_user(db=db, user_id=parent_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {parent_in.user_id} not found."
        )

    # 2. Kiểm tra user đã là parent chưa
    existing_parent = parent_crud.get_parent_by_user_id(db=db, user_id=parent_in.user_id)
    if existing_parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with id {parent_in.user_id} is already a parent."
        )

    # 3. Gán parent
    db_parent = parent_crud.create_parent(
        db=db,
        parent_in=parent_schema.ParentCreate(user_id=parent_in.user_id)
    )

    # 4. Cập nhật user_roles nếu chưa có role "parent"
    existing_role = user_role_crud.get_user_role(db, user_id=parent_in.user_id, role_name="parent")
    if not existing_role:
        user_role_crud.create_user_role(
            db=db,
            role_in=UserRoleCreate(
                user_id=parent_in.user_id,
                role_name="parent",
                assigned_at=datetime.utcnow()
            )
        )

    return db_parent

@router.get("/", response_model=List[parent_schema.Parent])
def read_all_parents(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả phụ huynh.
    """
    parents = parent_crud.get_all_parents(db, skip=skip, limit=limit)
    return parents

@router.get("/{parent_id}", response_model=parent_schema.Parent)
def read_parent(parent_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một phụ huynh cụ thể bằng ID.
    """
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )
    return db_parent

@router.put("/{parent_id}", response_model=parent_schema.Parent)
def update_existing_parent(parent_id: int, parent_update: parent_schema.ParentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một phụ huynh cụ thể bằng ID.
    """
    db_parent = parent_crud.update_parent(db, parent_id=parent_id, parent_update=parent_update)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )
    return db_parent

@router.delete("/{parent_id}", response_model=dict)
def delete_existing_parent(parent_id: int, db: Session = Depends(deps.get_db)):
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )

    deleted_parent = parent_crud.delete_parent(db, parent_id=parent_id)

    return {
        "deleted_parent": parent_schema.Parent.from_orm(deleted_parent).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }

