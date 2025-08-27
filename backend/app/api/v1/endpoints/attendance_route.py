# app/api/endpoints/attendances.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.attendance_schema import AttendanceRead, AttendanceBatchCreate, AttendanceUpdateLate
from app.services import attendance_service

# Thêm import cho dependency và schema đã cập nhật
from app.api.auth.auth import get_current_active_user, AuthenticatedUser

router = APIRouter()

# Phân quyền: Chỉ giáo viên hoặc quản lý mới có thể tạo bản ghi điểm danh
@router.post("/batch", response_model=list[AttendanceRead])
def create_attendance_records_for_class(
    attendance_data: AttendanceBatchCreate,
    db: Session = Depends(deps.get_db),
    # Sử dụng AuthenticatedUser schema để truy cập roles
    user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Tạo bản ghi điểm danh ban đầu cho một lớp.
    """
    # Lấy vai trò của người dùng từ đối tượng AuthenticatedUser
    if "teacher" not in user.roles and "manager" not in user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền để thực hiện hành động này."
        )
    
    try:
        return attendance_service.create_batch_attendance(db, attendance_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# Phân quyền: Chỉ giáo viên hoặc quản lý mới có thể cập nhật trạng thái điểm danh
@router.patch("/{student_id}/{class_id}", response_model=AttendanceRead)
def update_student_late_attendance(
    student_id: int,
    class_id: int,
    update_data: AttendanceUpdateLate,
    db: Session = Depends(deps.get_db),
    # Sử dụng AuthenticatedUser schema để truy cập roles
    user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Cập nhật trạng thái điểm danh từ 'absent' sang 'late'
    khi sinh viên đến muộn.
    """
    # Lấy vai trò của người dùng từ đối tượng AuthenticatedUser
    if "teacher" not in user.roles and "manager" not in user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền để thực hiện hành động này."
        )

    updated_record = attendance_service.update_late_attendance(
        db, 
        student_id=student_id, 
        class_id=class_id, 
        checkin_time=update_data.checkin_time
    )
    if not updated_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bản ghi điểm danh để cập nhật.")
    return updated_record
