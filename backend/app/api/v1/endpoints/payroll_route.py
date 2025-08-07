# app/api/v1/endpoints/payroll_route.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import các CRUD operations và schemas trực tiếp
from app.crud import payroll_crud
# Sửa lỗi: Import đúng tên module là staff_crud
from app.crud import staff_crud 
from app.schemas import payroll_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=payroll_schema.Payroll, status_code=status.HTTP_201_CREATED)
def create_new_payroll(payroll_in: payroll_schema.PayrollCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi bảng lương mới.
    """
    # Bước 1: Kiểm tra xem employee_id có tồn tại trong bảng employees không
    # Sửa lỗi: Dùng đúng tên module `staff_crud` và hàm `get_staff`
    db_employee = staff_crud.get_staff(db, staff_id=payroll_in.employee_id)
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with id {payroll_in.employee_id} not found."
        )

    # Bước 2: Tạo bản ghi bảng lương
    return payroll_crud.create_payroll(db=db, payroll=payroll_in)

@router.get("/", response_model=List[payroll_schema.Payroll])
def read_all_payrolls(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi bảng lương.
    """
    payrolls = payroll_crud.get_all_payrolls(db, skip=skip, limit=limit)
    return payrolls

@router.get("/{payroll_id}", response_model=payroll_schema.Payroll)
def read_payroll(payroll_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi bảng lương cụ thể bằng ID.
    """
    db_payroll = payroll_crud.get_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    return db_payroll

@router.put("/{payroll_id}", response_model=payroll_schema.Payroll)
def update_existing_payroll(payroll_id: int, payroll_update: payroll_schema.PayrollUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi bảng lương cụ thể bằng ID.
    """
    db_payroll = payroll_crud.update_payroll(db, payroll_id=payroll_id, payroll_update=payroll_update)
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
    db_payroll = payroll_crud.delete_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
