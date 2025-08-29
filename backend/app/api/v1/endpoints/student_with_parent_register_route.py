# app/api/v1/endpoints/student_with_parent_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Import dependency factory
from app.api.auth.auth import has_roles

# Import schemas từ các file tương ứng
from app.schemas import student_schema
# Import CRUD operations từ các file tương ứng
from app.crud import parent_crud, student_crud
from app.api import deps

router = APIRouter()

# Dependency cho quyền truy cập của Manager hoặc Teacher
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])

# --- Định nghĩa Schema cho Request Body ---
class StudentWithParentRegisterRequest(student_schema.StudentCreate):
    """
    Schema cho yêu cầu đăng ký một học sinh mới và liên kết với một phụ huynh đã tồn tại.
    """
    parent_id: int

# --- Endpoint API mới ---
@router.post("/register-student-with-parent/",
             response_model=student_schema.Student,
             status_code=status.HTTP_201_CREATED,
             summary="Đăng ký một học sinh mới và liên kết với một phụ huynh đã tồn tại.",
             dependencies=[Depends(MANAGER_OR_TEACHER)]) # Chỉ manager hoặc teacher mới có quyền
def register_student_with_parent(
    request_data: StudentWithParentRegisterRequest,
    db: Session = Depends(deps.get_db)
):
    """
    Đăng ký một học sinh mới và liên kết với một phụ huynh đã tồn tại.
    
    - **Bước 1**: Kiểm tra xem parent_id có tồn tại hay không.
    - **Bước 2**: Tạo học sinh mới và liên kết với phụ huynh đó.
    
    Quyền truy cập: **manager**, **teacher**
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
    # Lưu ý: Các trường 'first_name', 'last_name', 'email' được lấy từ StudentCreate
    student_in = student_schema.StudentCreate(
        user_id=request_data.user_id,
        parent_id=request_data.parent_id,
        first_name=request_data.first_name,
        last_name=request_data.last_name,
        email=request_data.email
    )
    
    try:
        db_student = student_crud.create_student(db=db, student=student_in)
    except Exception as e:
        # Xử lý lỗi nếu có, ví dụ: user_id đã tồn tại
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể tạo học sinh. Có thể user_id đã tồn tại hoặc lỗi khác. Chi tiết: {e}"
        )
        
    return db_student
