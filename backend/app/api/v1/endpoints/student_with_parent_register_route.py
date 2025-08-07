# app/api/v1/endpoints/student_with_parent_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import schemas từ các file tương ứng
from app.schemas import student_schema, parent_schema
# Import CRUD operations từ các file tương ứng
from app.crud import parent_crud, student_crud
from app.api import deps

router = APIRouter()

# --- Định nghĩa Schema cho Request Body ---
class StudentWithParentRegisterRequest(student_schema.StudentCreate):
    """
    Schema cho yêu cầu đăng ký một học sinh mới và liên kết với một phụ huynh đã tồn tại.
    """
    parent_id: int

# --- Endpoint API mới ---
@router.post("/register-student-with-parent/",
             response_model=student_schema.Student,
             status_code=status.HTTP_201_CREATED)
def register_student_with_parent(
    request_data: StudentWithParentRegisterRequest,
    db: Session = Depends(deps.get_db)
):
    """
    Đăng ký một học sinh mới và liên kết với một phụ huynh đã tồn tại.
    
    - **Bước 1**: Kiểm tra xem parent_id có tồn tại hay không.
    - **Bước 2**: Tạo học sinh mới và liên kết với phụ huynh đó.
    """
    # Bước 1: Kiểm tra xem parent_id có tồn tại không
    db_parent = parent_crud.get_parent(db, parent_id=request_data.parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy phụ huynh với ID: {request_data.parent_id}"
        )
    
    # Bước 2: Tạo học sinh mới
    # Tạo một StudentCreate schema từ dữ liệu request
    student_in = student_schema.StudentCreate(
        user_id=request_data.user_id,
        parent_id=request_data.parent_id,
        first_name=request_data.first_name,
        last_name=request_data.last_name,
        email=request_data.email
    )
    
    # Giả định rằng hàm create_student sẽ kiểm tra user_id đã tồn tại chưa
    try:
        db_student = student_crud.create_student(db=db, student=student_in)
    except Exception as e:
        # Xử lý lỗi nếu có, ví dụ: user_id đã tồn tại
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể tạo học sinh. Có thể user_id đã tồn tại hoặc lỗi khác. Chi tiết: {e}"
        )
        
    return db_student
