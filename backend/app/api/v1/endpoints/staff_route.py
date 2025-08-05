from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import staff_crud as crud_staff
from app.schemas import staff_schema as schemas_staff
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_staff.Staff, status_code=status.HTTP_201_CREATED)
def create_new_staff(staff: schemas_staff.StaffCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một nhân viên mới.
    """
    # Kiểm tra user_id đã tồn tại hay chưa
    existing_staff = crud_staff.get_staff_by_user_id(db, user_id=staff.user_id)
    if existing_staff:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một nhân viên khác."
        )
    return crud_staff.create_staff(db=db, staff=staff)

@router.get("/", response_model=List[schemas_staff.Staff])
def read_all_staff(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả nhân viên.
    """
    staff_members = crud_staff.get_all_staff(db, skip=skip, limit=limit)
    return staff_members

@router.get("/{staff_id}", response_model=schemas_staff.Staff)
def read_staff(staff_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một nhân viên cụ thể bằng ID.
    """
    db_staff = crud_staff.get_staff(db, staff_id=staff_id)
    if db_staff is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )
    return db_staff

@router.put("/{staff_id}", response_model=schemas_staff.Staff)
def update_existing_staff(staff_id: int, staff: schemas_staff.StaffUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một nhân viên cụ thể bằng ID.
    """
    db_staff = crud_staff.update_staff(db, staff_id=staff_id, staff_update=staff)
    if db_staff is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )
    return db_staff

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_staff(staff_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một nhân viên cụ thể bằng ID.
    """
    db_staff = crud_staff.delete_staff(db, staff_id=staff_id)
    if db_staff is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )
    return {"message": "Nhân viên đã được xóa thành công."}

