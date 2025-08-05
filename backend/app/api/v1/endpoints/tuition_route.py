from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import tuition_crud as crud_tuition
from app.schemas import tuition_schema as schemas_tuition
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_tuition.Tuition, status_code=status.HTTP_201_CREATED)
def create_new_tuition(tuition: schemas_tuition.TuitionCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi học phí mới.
    """
    return crud_tuition.create_tuition(db=db, tuition=tuition)

@router.get("/", response_model=List[schemas_tuition.Tuition])
def read_all_tuitions(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi học phí.
    """
    tuitions = crud_tuition.get_all_tuitions(db, skip=skip, limit=limit)
    return tuitions

@router.get("/{tuition_id}", response_model=schemas_tuition.Tuition)
def read_tuition(tuition_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi học phí cụ thể bằng ID.
    """
    db_tuition = crud_tuition.get_tuition(db, tuition_id=tuition_id)
    if db_tuition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học phí không tìm thấy."
        )
    return db_tuition

@router.put("/{tuition_id}", response_model=schemas_tuition.Tuition)
def update_existing_tuition(tuition_id: int, tuition: schemas_tuition.TuitionUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi học phí cụ thể bằng ID.
    """
    db_tuition = crud_tuition.update_tuition(db, tuition_id=tuition_id, tuition_update=tuition)
    if db_tuition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học phí không tìm thấy."
        )
    return db_tuition

@router.delete("/{tuition_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_tuition(tuition_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi học phí cụ thể bằng ID.
    """
    db_tuition = crud_tuition.delete_tuition(db, tuition_id=tuition_id)
    if db_tuition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học phí không tìm thấy."
        )
    return {"message": "Học phí đã được xóa thành công."}

