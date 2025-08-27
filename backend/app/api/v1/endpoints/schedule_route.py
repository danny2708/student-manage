from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as dt_date

# Tự động nhập tất cả các module cần thiết
from app.crud import schedule_crud
from app.schemas import schedule_schema
from app.api import deps
from app.api.auth.auth import AuthenticatedUser, get_current_active_user
from app.models.schedule_model import DayOfWeekEnum, ScheduleTypeEnum

# Import service layer
from app.services import schedule_service

router = APIRouter()

@router.post("/schedules/", response_model=schedule_schema.Schedule, status_code=status.HTTP_201_CREATED)
def create_schedule_route(
    schedule_in: schedule_schema.ScheduleCreate, 
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Tạo một lịch trình mới sau khi kiểm tra xung đột và quyền.
    Chỉ Quản lý và Giáo viên được phép.
    """
    # Kiểm tra quyền truy cập của người dùng
    if "manager" not in current_user.roles and "teacher" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền tạo lịch trình."
        )

    # Gọi service layer để xử lý logic tạo lịch, bao gồm cả kiểm tra xung đột và quyền của giáo viên
    try:
        db_schedule = schedule_service.create_schedule_with_validation(
            db=db, 
            schedule_in=schedule_in, 
            current_user=current_user
        )
        return db_schedule
    except HTTPException as e:
        # Re-raise HTTPException để FastAPI xử lý
        raise e

@router.get("/schedules/", response_model=List[schedule_schema.Schedule])
def search_schedules_route(
    db: Session = Depends(deps.get_db),
    class_id: Optional[int] = Query(None, description="Lọc theo ID lớp học"),
    schedule_type: Optional[ScheduleTypeEnum] = Query(None, description="Lọc theo loại lịch trình (WEEKLY hoặc ONE_OFF)"),
    day_of_week: Optional[DayOfWeekEnum] = Query(None, description="Lọc theo ngày trong tuần"),
    date: Optional[dt_date] = Query(None, description="Lọc theo ngày cụ thể"),
    room: Optional[str] = Query(None, description="Lọc theo phòng học"),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Tìm kiếm và lấy danh sách các lịch trình với các tùy chọn lọc.
    Kết quả sẽ được lọc dựa trên vai trò của người dùng.
    """
    schedules = schedule_service.search_schedules_by_user_role(
        db=db,
        current_user=current_user,
        class_id=class_id,
        schedule_type=schedule_type,
        day_of_week=day_of_week,
        date=date,
        room=room
    )
    # Trả về danh sách rỗng nếu không tìm thấy kết quả, thay vì 404
    return schedules

@router.get("/schedules/{schedule_id}", response_model=schedule_schema.Schedule)
def get_schedule_route(
    schedule_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Lấy thông tin của một lịch trình cụ thể bằng ID, có kiểm tra quyền.
    """
    db_schedule = schedule_crud.get_schedule_by_id(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )

    # Kiểm tra quyền truy cập bằng service layer
    if not schedule_service.check_read_access(db=db, schedule=db_schedule, current_user=current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lịch trình này."
        )
    return db_schedule

@router.put("/schedules/{schedule_id}", response_model=schedule_schema.Schedule)
def update_existing_schedule_route(
    schedule_id: int, 
    schedule_update: schedule_schema.ScheduleUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin của một lịch trình cụ thể bằng ID.
    Chỉ Quản lý và Giáo viên được phép.
    """
    db_schedule = schedule_crud.get_schedule_by_id(db, schedule_id=schedule_id)
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )

    # Kiểm tra quyền cập nhật bằng service layer
    if not schedule_service.check_update_access(db=db, schedule=db_schedule, current_user=current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật lịch trình này."
        )

    # Gọi CRUD layer để thực hiện cập nhật
    updated_schedule = schedule_crud.update_schedule(db, schedule=db_schedule, schedule_in=schedule_update)
    return updated_schedule

@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_schedule_route(
    schedule_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Xóa một lịch trình cụ thể bằng ID.
    Chỉ Quản lý được phép.
    """
    db_schedule = schedule_crud.get_schedule_by_id(db, schedule_id=schedule_id)
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )
    
    # Chỉ Quản lý mới có quyền xóa
    if "manager" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa lịch trình."
        )
    
    schedule_crud.delete_schedule(db, schedule=db_schedule)
    return

@router.get("/teachers/{teacher_id}/schedules/", response_model=List[schedule_schema.Schedule])
def get_teacher_schedules_route(
    teacher_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Lấy danh sách các lịch trình của một giáo viên cụ thể.
    Chỉ Quản lý và chính giáo viên đó mới được phép.
    """
    # Lấy user_id của giáo viên từ teacher_id
    teacher_user_id = schedule_service.get_user_id_from_teacher_id(db, teacher_id)
    
    # Chỉ Quản lý hoặc chính giáo viên có ID tương ứng mới có quyền truy cập
    if "manager" not in current_user.roles and current_user.user_id != teacher_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lịch trình của giáo viên này."
        )
        
    schedules = schedule_service.get_schedules_for_teacher(db=db, teacher_id=teacher_id)
    if not schedules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch trình nào cho giáo viên này."
        )
    return schedules

@router.get("/students/{student_id}/schedules/", response_model=List[schedule_schema.Schedule])
def get_student_schedules_route(
    student_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Lấy danh sách các lịch trình của một học sinh cụ thể.
    Chỉ Quản lý, phụ huynh hoặc chính học sinh đó mới được phép.
    """
    # Lấy user_id của học sinh từ student_id
    student_user_id = schedule_service.get_user_id_from_student_id(db, student_id)
    
    # Kiểm tra quyền truy cập
    is_manager = "manager" in current_user.roles
    is_student_self = current_user.user_id == student_user_id
    is_parent_of_student = schedule_service.is_parent_of_student(db, current_user.user_id, student_user_id)

    if not (is_manager or is_student_self or is_parent_of_student):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lịch trình của học sinh này."
        )
        
    schedules = schedule_service.get_schedules_for_student(db=db, student_id=student_id)
    if not schedules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch trình nào cho sinh viên này."
        )
    return schedules
