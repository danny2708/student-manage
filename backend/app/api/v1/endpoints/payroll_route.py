import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

# Import các CRUD operations và schemas trực tiếp
from app.crud import payroll_crud
from app.crud import teacher_crud
from app.crud import notification_crud
from app.schemas import payroll_schema
from app.schemas.notification_schema import NotificationCreate
from app.api import deps
from app.services import payroll_service

router = APIRouter()

@router.post("/", response_model=payroll_schema.Payroll, status_code=status.HTTP_201_CREATED)
def create_new_payroll(payroll_in: payroll_schema.PayrollCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi bảng lương mới.
    """
    # Bước 1: Kiểm tra xem teacher_id có tồn tại trong bảng teachers không
    db_teacher = teacher_crud.get_teacher(db, teacher_id=payroll_in.teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with teacher_id {payroll_in.teacher_id} not found."
        )

    # Bước 2: Tạo bản ghi bảng lương
    return payroll_crud.create_payroll_record(db=db, payroll=payroll_in)

@router.get("/", response_model=List[payroll_schema.Payroll])
def get_all_payrolls(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi bảng lương.
    """
    payrolls = payroll_crud.get_all_payrolls(db, skip=skip, limit=limit)
    return payrolls

@router.get("/run_payroll", status_code=status.HTTP_200_OK)
def run_payroll(db: Session = Depends(deps.get_db)):
    """
    Chạy quá trình tính lương hàng tháng (thủ công).
    """
    try:
        payroll_service.run_monthly_payroll(db)
        return {"message": "Monthly payroll process completed successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during payroll processing: {str(e)}"
        )

@router.get("/{payroll_id}", response_model=payroll_schema.Payroll)
def get_payroll(payroll_id: int, db: Session = Depends(deps.get_db)):
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

@router.delete("/{payroll_id}", response_model=dict)
def delete_existing_payroll(payroll_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi bảng lương và trả về nội dung của bản ghi đã xóa.
    """
    db_payroll = payroll_crud.get_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bảng lương !"
        )

    # Đã xóa `status_code=status.HTTP_204_NO_CONTENT` để cho phép body phản hồi.
    # Sử dụng `deleted_payroll` để trả về nội dung của bản ghi đã xóa.
    deleted_payroll = payroll_crud.delete_payroll(db, payroll_id=payroll_id)

    return {
        "deleted_payroll": payroll_schema.Payroll.from_orm(deleted_payroll).dict(),
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "status": "success"
    }

@router.post("/send_payroll_notification", status_code=status.HTTP_201_CREATED)
def send_payroll_notification(payroll_id: int, db: Session = Depends(deps.get_db)):
    """
    Gửi thông báo bảng lương cho giáo viên.
    """
    db_payroll = payroll_crud.get_payroll(db, payroll_id=payroll_id)
    if not db_payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    
    # Bước trung gian: Truy vấn thông tin giáo viên từ teacher_id có trong bản ghi payroll
    db_teacher = teacher_crud.get_teacher(db, teacher_id=db_payroll.teacher_id)
    if not db_teacher:
        # Nếu không tìm thấy giáo viên, có thể đây là một lỗi dữ liệu
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy thông tin giáo viên với teacher_id {db_payroll.teacher_id}."
        )

    receiver_id = db_teacher.user_id
    
    # Tạo nội dung thông báo
    content = f"Bảng lương tháng {db_payroll.month} của bạn đã được cập nhật. Tổng lương: {db_payroll.total}"
    
    # Tạo bản ghi thông báo
    notification_in = NotificationCreate(
        sender_id=None, # Hoặc một user_id của admin/hệ thống
        receiver_id=receiver_id,
        content=content,
        sent_at=datetime.now(timezone.utc),
        type="payroll"
    )
    
    # Gửi thông báo
    notification_crud.create_notification(db, notification_in)
    
    return {"message": "Notification sent successfully."}

@router.get("/teacher/{teacher_id}", response_model=List[payroll_schema.Payroll])
def get_teacher_payrolls(teacher_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách các bản ghi bảng lương của một người dùng cụ thể.
    """
    payrolls = payroll_crud.get_payrolls_by_teacher_id(db, teacher_id=teacher_id, skip=skip, limit=limit)
    if not payrolls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bảng lương nào cho người dùng này."
        )
    return payrolls
