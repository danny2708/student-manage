# app/crud/teacher_review_crud.py
from sqlalchemy.orm import Session
from app.models.teacher_review_model import TeacherReview
from app.schemas.teacher_review_schema import TeacherReviewCreate, TeacherReviewUpdate
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def get_teacher_review(db: Session, review_id: int):
    """Get teacher review by ID."""
    return db.query(TeacherReview).filter(TeacherReview.review_id == review_id).first()

def get_teacher_reviews_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100):
    """Get a list of reviews by teacher_id."""
    return db.query(TeacherReview).filter(TeacherReview.teacher_id == teacher_id).offset(skip).limit(limit).all()

def get_teacher_reviews_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Get a list of reviews by student_id."""
    return db.query(TeacherReview).filter(TeacherReview.student_id == student_id).offset(skip).limit(limit).all()

def get_all_teacher_reviews(db: Session, skip: int = 0, limit: int = 100):
    """Get a list of all teacher reviews."""
    return db.query(TeacherReview).offset(skip).limit(limit).all()

def create_teacher_review(db: Session, teacher_review: TeacherReviewCreate):
    """Create a new teacher review record."""
    teacher_review_data = teacher_review.model_dump()
    db_teacher_review = TeacherReview(**teacher_review_data, review_date=datetime.now())
    
    db.add(db_teacher_review)
    db.commit()
    db.refresh(db_teacher_review)
    return db_teacher_review

def update_teacher_review(db: Session, review_id: int, teacher_review_update: TeacherReviewUpdate):
    """Update teacher review information."""
    db_teacher_review = db.query(TeacherReview).filter(TeacherReview.review_id == review_id).first()
    if db_teacher_review:
        update_data = teacher_review_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_teacher_review, key, value)
        db.add(db_teacher_review)
        db.commit()
        db.refresh(db_teacher_review)
    return db_teacher_review

def delete_teacher_review(db: Session, review_id: int):
    """
    Xóa một bản ghi đánh giá giáo viên và trả về tin nhắn phản hồi.
    """
    db_teacher_review = db.query(TeacherReview).filter(TeacherReview.review_id == review_id).first()
    
    if db_teacher_review:
        # Xóa bản ghi
        db.delete(db_teacher_review)
        db.commit()
        # Trả về thông tin của bản ghi đã xóa
        return {
            "message": f"Successfully deleted review with ID: {review_id}",
            "deleted_review": {
                "review_id": db_teacher_review.review_id,
                "teacher_id": db_teacher_review.teacher_id,
                "student_id": db_teacher_review.student_id,
                "rating": db_teacher_review.rating,
                "review_text": db_teacher_review.review_text
            }
        }
    else:
        # Trả về lỗi nếu không tìm thấy review
        return {"message": f"Review with ID {review_id} not found."}
