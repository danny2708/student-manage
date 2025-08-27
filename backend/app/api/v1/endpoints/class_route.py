# app/api/endpoints/class.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.api.deps import get_db
from app.api.auth.auth import AuthenticatedUser, get_current_manager, get_current_manager_or_teacher
from app.crud import class_crud
from app.schemas import class_schema
from app.services.excel_services.export_class import export_class

router = APIRouter()

# --- Endpoint nhóm theo vai trò ---

# Các endpoints chỉ dành cho Manager
# Lưu ý: Mỗi endpoint có thể có dependency riêng, nhưng để gọn, ta có thể nhóm lại

# Tạo lớp học mới
@router.post(
    "/",
    response_model=class_schema.Class,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo một lớp học mới"
)
def create_new_class(
    class_in: class_schema.ClassCreate,
    db: Session = Depends(get_db),
    # Dependency để đảm bảo chỉ manager mới có thể truy cập
    current_user: AuthenticatedUser = Depends(get_current_manager)
):
    """
    Tạo một lớp học mới.
    
    Quyền truy cập: **manager**
    """
    db_class = class_crud.get_class_by_name(db, class_name=class_in.class_name)
    if db_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên lớp học đã tồn tại."
        )
    return class_crud.create_class(db=db, class_data=class_in)

# Cập nhật thông tin lớp học
@router.put(
    "/{class_id}",
    response_model=class_schema.Class,
    summary="Cập nhật thông tin của một lớp học"
)
def update_existing_class(
    class_id: int,
    class_update: class_schema.ClassUpdate,
    db: Session = Depends(get_db),
    # Dependency để đảm bảo chỉ manager mới có thể truy cập
    current_user: AuthenticatedUser = Depends(get_current_manager)
):
    """
    Cập nhật thông tin của một lớp học cụ thể bằng ID.
    
    Quyền truy cập: **manager**
    """
    db_class = class_crud.update_class(db, class_id=class_id, class_update=class_update)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    return db_class

# Xóa lớp học
@router.delete(
    "/{class_id}",
    response_model=dict,
    summary="Xóa một lớp học"
)
def delete_existing_class(
    class_id: int,
    db: Session = Depends(get_db),
    # Dependency để đảm bảo chỉ manager mới có thể truy cập
    current_user: AuthenticatedUser = Depends(get_current_manager)
):
    """
    Xóa một lớp học cụ thể bằng ID.
    
    Quyền truy cập: **manager**
    """
    db_class = class_crud.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    deleted_class = class_crud.delete_class(db, class_id=class_id)
    return {
        "deleted_class": class_schema.Class.from_orm(deleted_class).dict(),
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "status": "success"
    }

# Các endpoints dành cho cả Manager và Teacher
# Sử dụng router.get với dependency chung
@router.get(
    "/",
    response_model=List[class_schema.Class],
    summary="Lấy danh sách tất cả các lớp học"
)
def get_all_classes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # Dependency để đảm bảo chỉ manager hoặc Teacher mới có thể truy cập
    current_user: AuthenticatedUser = Depends(get_current_manager_or_teacher)
):
    """
    Lấy danh sách tất cả các lớp học.
    
    Quyền truy cập: **manager**, **Teacher**
    """
    classes = class_crud.get_all_classes(db, skip=skip, limit=limit)
    return classes

@router.get(
    "/{class_id}",
    response_model=class_schema.Class,
    summary="Lấy thông tin của một lớp học"
)
def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    # Dependency để đảm bảo chỉ manager hoặc Teacher mới có thể truy cập
    current_user: AuthenticatedUser = Depends(get_current_manager_or_teacher)
):
    """
    Lấy thông tin của một lớp học cụ thể bằng ID.
    
    Quyền truy cập: **manager**, **Teacher**
    """
    db_class = class_crud.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    return db_class

@router.get(
    "/export/{class_id}",
    summary="Xuất danh sách lớp học ra file Excel"
)
def export_class_excel(
    class_id: int,
    db: Session = Depends(get_db),
    # Dependency để đảm bảo chỉ manager hoặc Teacher mới có thể truy cập
    current_user: AuthenticatedUser = Depends(get_current_manager_or_teacher)
):
    """
    Xuất danh sách sinh viên của một lớp học ra file Excel.
    
    Quyền truy cập: **manager**, **Teacher**
    """
    return export_class(db, class_id)
