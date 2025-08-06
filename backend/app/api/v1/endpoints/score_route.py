from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import score_crud as crud_score
from app.schemas import score_schema as schemas_score
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_score.Score, status_code=status.HTTP_201_CREATED)
def create_new_score(score: schemas_score.ScoreCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi điểm số mới.
    """
    return crud_score.create_score(db=db, score=score)

@router.get("/", response_model=List[schemas_score.Score])
def read_all_scores(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả điểm số.
    """
    scores = crud_score.get_all_scores(db, skip=skip, limit=limit)
    return scores

@router.get("/{score_id}", response_model=schemas_score.Score)
def read_score(score_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi điểm số cụ thể bằng ID.
    """
    db_score = crud_score.get_score(db, score_id=score_id)
    if db_score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm số không tìm thấy."
        )
    return db_score

@router.put("/{score_id}", response_model=schemas_score.Score)
def update_existing_score(score_id: int, score: schemas_score.ScoreUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi điểm số cụ thể bằng ID.
    """
    db_score = crud_score.update_score(db, score_id=score_id, score_update=score)
    if db_score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm số không tìm thấy."
        )
    return db_score

@router.delete("/{score_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_score(score_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi điểm số cụ thể bằng ID.
    """
    db_score = crud_score.delete_score(db, score_id=score_id)
    if db_score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm số không tìm thấy."
        )
    return {"message": "Điểm số đã được xóa thành công."}

