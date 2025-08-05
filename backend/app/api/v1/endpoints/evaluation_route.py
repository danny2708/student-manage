from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import evaluation_crud as crud_evaluation
from app.schemas import evaluation_schema as schemas_evaluation
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_evaluation.Evaluation, status_code=status.HTTP_201_CREATED)
def create_new_evaluation(evaluation: schemas_evaluation.EvaluationCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi đánh giá mới.
    """
    # Bạn có thể thêm kiểm tra xem student_id có tồn tại không
    return crud_evaluation.create_evaluation(db=db, evaluation=evaluation)

@router.get("/", response_model=List[schemas_evaluation.Evaluation])
def read_all_evaluations(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi đánh giá.
    """
    evaluations = crud_evaluation.get_all_evaluations(db, skip=skip, limit=limit)
    return evaluations

@router.get("/{evaluation_id}", response_model=schemas_evaluation.Evaluation)
def read_evaluation(evaluation_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi đánh giá cụ thể bằng ID.
    """
    db_evaluation = crud_evaluation.get_evaluation(db, evaluation_id=evaluation_id)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    return db_evaluation

@router.put("/{evaluation_id}", response_model=schemas_evaluation.Evaluation)
def update_existing_evaluation(evaluation_id: int, evaluation: schemas_evaluation.EvaluationUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi đánh giá cụ thể bằng ID.
    """
    db_evaluation = crud_evaluation.update_evaluation(db, evaluation_id=evaluation_id, evaluation_update=evaluation)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    return db_evaluation

@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_evaluation(evaluation_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi đánh giá cụ thể bằng ID.
    """
    db_evaluation = crud_evaluation.delete_evaluation(db, evaluation_id=evaluation_id)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    return {"message": "Đánh giá đã được xóa thành công."}

