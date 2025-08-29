# app/api/v1/endpoints/tuition_route.py
from datetime import date
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api import deps
from app.schemas.tuition_schema import TuitionCreate, TuitionUpdate, TuitionRead, TuitionPaymentStatusUpdate
from app.models.tuition_model import PaymentStatus
from app.crud import tuition_crud
from app.services import tuition_service
# Import dependency factory
from app.api.auth.auth import has_roles, get_current_active_user

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

# Dependency cho quyền truy cập của Manager hoặc Teacher
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])

# Dependency cho quyền truy cập của Student
STUDENT_ONLY = has_roles(["student"])

# Dependency cho quyền truy cập của Parent
PARENT_ONLY = has_roles(["parent"])


@router.post(
    "/",
    response_model=TuitionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo một bản ghi học phí mới",
    dependencies=[Depends(MANAGER_ONLY)]
)
def create_tuition(
    tuition_in: TuitionCreate, 
    db: Session = Depends(deps.get_db)
):
    """
    Tạo một bản ghi học phí mới.
    
    Quyền truy cập: **manager**
    """
    return tuition_crud.create_tuition(db, tuition_in)

@router.get(
    "/{tuition_id}",
    response_model=TuitionRead,
    summary="Lấy thông tin của một bản ghi học phí cụ thể bằng ID",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_tuition(
    tuition_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy thông tin của một bản ghi học phí cụ thể bằng ID.

    Quyền truy cập: **manager**, **teacher**
    """
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found")
    return db_tuition

@router.get(
    "/",
    response_model=List[TuitionRead],
    summary="Lấy danh sách tất cả các bản ghi học phí",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def list_tuitions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db),
    payment_status: Optional[PaymentStatus] = Query(None, description="Lọc theo trạng thái thanh toán"),
    due_date: Optional[date] = Query(None, description="Lọc theo hạn thanh toán")
):
    """
    Lấy danh sách tất cả các bản ghi học phí.
    
    Tùy chọn lọc theo trạng thái thanh toán và hạn đóng.
    
    Quyền truy cập: **manager**, **teacher**
    """
    tuitions = tuition_crud.get_all_tuitions(
        db, 
        skip=skip, 
        limit=limit,
        payment_status=payment_status,
        due_date=due_date
    )
    return tuitions

@router.get(
    "/by_student/{student_id}",
    response_model=List[TuitionRead],
    summary="Lấy danh sách học phí của một học sinh",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Chỉ manager hoặc teacher có quyền xem học phí của học sinh khác
)
def get_tuitions_by_student_id(
    student_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách các bài kiểm tra của một học sinh cụ thể.
    
    Quyền truy cập: **manager**, **teacher**
    """
    tuitions = tuition_crud.get_tuitions_by_student_id(
        db, 
        student_id=student_id
    )
    if not tuitions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy học phí cho học sinh này.")
    return tuitions


@router.get(
    "/my_tuitions",
    response_model=List[TuitionRead],
    summary="Lấy danh sách học phí của người dùng hiện tại (học sinh)",
    dependencies=[Depends(STUDENT_ONLY)]
)
def get_my_tuitions(
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(get_current_active_user),
    payment_status: Optional[PaymentStatus] = Query(None, description="Lọc theo trạng thái thanh toán")
):
    """
    Lấy danh sách học phí của học sinh đã đăng nhập.
    
    Tùy chọn lọc theo trạng thái thanh toán.
    
    Quyền truy cập: **student**
    """
    student_id = current_user.get("id")
    if not student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không thể xác định học sinh.")
    
    tuitions = tuition_crud.get_tuitions_by_student_id(
        db, 
        student_id=student_id,
        payment_status=payment_status
    )
    return tuitions

@router.get(
    "/by_parent",
    response_model=List[TuitionRead],
    summary="Lấy danh sách học phí của tất cả học sinh thuộc một phụ huynh",
    dependencies=[Depends(PARENT_ONLY)]
)
def get_tuitions_by_parent(
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(get_current_active_user),
    payment_status: Optional[PaymentStatus] = Query(None, description="Lọc theo trạng thái thanh toán")
):
    """
    Lấy danh sách học phí của tất cả học sinh thuộc phụ huynh đã đăng nhập.
    
    Tùy chọn lọc theo trạng thái thanh toán.
    
    Quyền truy cập: **parent**
    """
    parent_id = current_user.get("id")
    if not parent_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không thể xác định phụ huynh.")
    
    tuitions = tuition_crud.get_tuitions_by_parent_id(
        db, 
        parent_id=parent_id,
        payment_status=payment_status
    )
    return tuitions


@router.put(
    "/{tuition_id}",
    response_model=TuitionRead,
    summary="Cập nhật các thông tin chi tiết của học phí",
    dependencies=[Depends(MANAGER_ONLY)]
)
def update_tuition_details(
    tuition_id: int,
    tuition_in: TuitionUpdate,
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật các thông tin chi tiết của học phí (hạn đóng, số tiền, kỳ học).
    
    Quyền truy cập: **manager**
    """
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found")
        
    if db_tuition.payment_status == PaymentStatus.paid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể cập nhật chi tiết học phí đã thanh toán.")

    updated_tuition = tuition_crud.update_tuition_details(db, db_obj=db_tuition, obj_in=tuition_in)
    return updated_tuition

@router.patch(
    "/{tuition_id}/status",
    response_model=TuitionRead,
    summary="Cập nhật trạng thái thanh toán của học phí",
    dependencies=[Depends(MANAGER_ONLY)]
)
def update_tuition_payment_status(
    tuition_id: int,
    status_in: TuitionPaymentStatusUpdate,
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật trạng thái thanh toán của học phí.
    
    Quyền truy cập: **manager**
    """
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found")
        
    updated_tuition = tuition_crud.update_tuition_payment_status(db, db_obj=db_tuition, obj_in=status_in.payment_status)
    return updated_tuition

@router.delete(
    "/{tuition_id}",
    summary="Xóa một bản ghi học phí",
    dependencies=[Depends(MANAGER_ONLY)]
)
def delete_tuition(
    tuition_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một bản ghi học phí.
    
    Quyền truy cập: **manager**
    """
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found")

    deleted_tuition = tuition_crud.delete_tuition(db, db_obj=db_tuition)

    return {
        "message": "Bản ghi học phí đã được xóa thành công.",
        "deleted_tuition_id": deleted_tuition.id,
        "status": "success"
    }

@router.post(
    "/generate-all",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Kích hoạt quá trình tạo học phí cho tất cả học sinh",
    dependencies=[Depends(MANAGER_ONLY)]
)
def generate_tuition_for_all_students(
    background_tasks: BackgroundTasks,
    term: int = Query(..., gt=0, description="Kỳ học để tạo học phí"),
    due_date: date = Query(..., description="Hạn thanh toán"),
    db: Session = Depends(deps.get_db),
):
    """
    Kích hoạt quá trình tính toán và tạo bản ghi học phí cho **tất cả** học sinh.
    
    Quá trình này sẽ chạy ngầm để không làm treo hệ thống.
    
    Quyền truy cập: **manager**
    """
    # Thêm tác vụ vào hàng đợi chạy nền
    background_tasks.add_task(
        tuition_service.create_tuition_for_all_students,
        db=db,
        term=term,
        due_date=due_date
    )
    
    # Trả về thông báo ngay lập tức
    return {"message": "Đã chấp nhận yêu cầu. Quá trình tạo học phí đang được xử lý trong nền."}
