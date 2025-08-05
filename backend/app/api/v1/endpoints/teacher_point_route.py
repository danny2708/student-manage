from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import teacherpoint_crud as crud_teacherpoint
from app.schemas import teacherpoint_schema as schemas_teacherpoint
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_teacherpoint.TeacherPoint, status_code=status.HTTP_201_CREATED)
def create_new_teacher_point(teacher_point: schemas_teacherpoint.TeacherPointCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi điểm thưởng/phạt giáo viên mới.
    """
    # Bạn có thể thêm kiểm tra xem teacher_id có tồn tại không
    return crud_teacherpoint.create_teacher_point(db=db, teacher_point=teacher_point)

@router.get("/", response_model=List[schemas_teacherpoint.TeacherPoint])
def read_all_teacher_points(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi điểm thưởng/phạt giáo viên.
    """
    teacher_points = crud_teacherpoint.get_all_teacher_points(db, skip=skip, limit=limit)
    return teacher_points

@router.get("/{point_id}", response_model=schemas_teacherpoint.TeacherPoint)
def read_teacher_point(point_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi điểm thưởng/phạt giáo viên cụ thể bằng ID.
    """
    db_teacher_point = crud_teacherpoint.get_teacher_point(db, point_id=point_id)
    if db_teacher_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm thưởng/phạt giáo viên không tìm thấy."
        )
    return db_teacher_point

@router.put("/{point_id}", response_model=schemas_teacherpoint.TeacherPoint)
def update_existing_teacher_point(point_id: int, teacher_point: schemas_teacherpoint.TeacherPointUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi điểm thưởng/phạt giáo viên cụ thể bằng ID.
    """
    db_teacher_point = crud_teacherpoint.update_teacher_point(db, point_id=point_id, teacher_point_update=teacher_point)
    if db_teacher_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm thưởng/phạt giáo viên không tìm thấy."
        )
    return db_teacher_point

@router.delete("/{point_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_teacher_point(point_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi điểm thưởng/phạt giáo viên cụ thể bằng ID.
    """
    db_teacher_point = crud_teacherpoint.delete_teacher_point(db, point_id=point_id)
    if db_teacher_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm thưởng/phạt giáo viên không tìm thấy."
        )
    return {"message": "Điểm thưởng/phạt giáo viên đã được xóa thành công."}

