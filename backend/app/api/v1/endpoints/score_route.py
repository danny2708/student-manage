# app/api/v1/endpoints/score_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations và schemas trực tiếp
from app.crud import score_crud
from app.crud import student_crud # Giả định có một crud cho student
from app.crud import subject_crud # Giả định có một crud cho subject
from app.schemas import score_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=score_schema.Score, status_code=status.HTTP_201_CREATED)
def create_new_score(score_in: score_schema.ScoreCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi điểm số mới.
    """
    # Bước 1: Kiểm tra xem student_id có tồn tại không
    db_student = student_crud.get_student(db, student_id=score_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {score_in.student_id} not found."
        )

    # Bước 2: Kiểm tra xem subject_id có tồn tại không
    db_subject = subject_crud.get_subject(db, subject_id=score_in.subject_id)
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with id {score_in.subject_id} not found."
        )

    # Bước 3: Tạo bản ghi điểm số
    return score_crud.create_score(db=db, score=score_in)

@router.get("/", response_model=List[score_schema.Score])
def read_all_scores(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả điểm số.
    """
    scores = score_crud.get_all_scores(db, skip=skip, limit=limit)
    return scores

@router.get("/{score_id}", response_model=score_schema.Score)
def read_score(score_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi điểm số cụ thể bằng ID.
    """
    db_score = score_crud.get_score(db, score_id=score_id)
    if db_score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm số không tìm thấy."
        )
    return db_score

@router.put("/{score_id}", response_model=score_schema.Score)
def update_existing_score(score_id: int, score_update: score_schema.ScoreUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi điểm số cụ thể bằng ID.
    """
    db_score = score_crud.update_score(db, score_id=score_id, score_update=score_update)
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
    db_score = score_crud.delete_score(db, score_id=score_id)
    if db_score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm số không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
