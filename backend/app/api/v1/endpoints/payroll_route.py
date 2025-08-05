from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import payroll_crud as crud_payroll
from app.schemas import payroll_schema as schemas_payroll
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_payroll.Payroll, status_code=status.HTTP_201_CREATED)
def create_new_payroll(payroll: schemas_payroll.PayrollCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi bảng lương mới.
    """
    return crud_payroll.create_payroll(db=db, payroll=payroll)

@router.get("/", response_model=List[schemas_payroll.Payroll])
def read_all_payrolls(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi bảng lương.
    """
    payrolls = crud_payroll.get_all_payrolls(db, skip=skip, limit=limit)
    return payrolls

@router.get("/{payroll_id}", response_model=schemas_payroll.Payroll)
def read_payroll(payroll_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi bảng lương cụ thể bằng ID.
    """
    db_payroll = crud_payroll.get_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    return db_payroll

@router.put("/{payroll_id}", response_model=schemas_payroll.Payroll)
def update_existing_payroll(payroll_id: int, payroll: schemas_payroll.PayrollUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi bảng lương cụ thể bằng ID.
    """
    db_payroll = crud_payroll.update_payroll(db, payroll_id=payroll_id, payroll_update=payroll)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    return db_payroll

@router.delete("/{payroll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_payroll(payroll_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi bảng lương cụ thể bằng ID.
    """
    db_payroll = crud_payroll.delete_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    return {"message": "Bảng lương đã được xóa thành công."}

