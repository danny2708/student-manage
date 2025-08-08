from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations
from app.crud import staff_crud
from app.crud import user_crud  # THÊM: Import user_crud để kiểm tra user_id

# Import các schemas cần thiết
from app.schemas import staff_schema 
from app.schemas.user_role import StaffCreateWithUser  # THÊM: Import schema cần thiết

# Import các dependencies
from app.api import deps

router = APIRouter()

@router.post("/", response_model=staff_schema.Staff, status_code=status.HTTP_201_CREATED)
def create_staff(staff_in: StaffCreateWithUser, db: Session = Depends(deps.get_db)):
    """
    Tạo một vai trò staff mới và liên kết nó với một người dùng đã tồn tại.
    """
    # Bước 1: Kiểm tra xem user_id có tồn tại không
    db_user = user_crud.get_user(db=db, user_id=staff_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {staff_in.user_id} not found."
        )

    # Bước 2: Kiểm tra xem người dùng này đã có vai trò staff chưa
    existing_staff = staff_crud.get_staff_by_user_id(db=db, user_id=staff_in.user_id)
    if existing_staff:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một staff khác."
        )

    # Bước 3: Tạo bản ghi staff và liên kết với user_id
    # Hàm staff_crud.create_staff nên nhận Pydantic model trực tiếp
    db_staff = staff_crud.create_staff(db=db, staff_in=staff_in)
    return db_staff

@router.get("/", response_model=List[staff_schema.Staff])
def read_all_staff(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả nhân viên.
    """
    staff_members = staff_crud.get_all_staff(db, skip=skip, limit=limit)
    return staff_members

@router.get("/{staff_id}", response_model=staff_schema.Staff)
def read_staff(staff_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một nhân viên cụ thể bằng ID.
    """
    db_staff = staff_crud.get_staff(db, staff_id=staff_id)
    if db_staff is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )
    return db_staff

@router.put("/{staff_id}", response_model=staff_schema.Staff)
def update_existing_staff(staff_id: int, staff: staff_schema.StaffUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một nhân viên cụ thể bằng ID.
    """
    db_staff = staff_crud.update_staff(db, staff_id=staff_id, staff_update=staff)
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
    db_staff = staff_crud.delete_staff(db, staff_id=staff_id)
    if db_staff is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, vì đây là tiêu chuẩn cho xóa thành công
    return
