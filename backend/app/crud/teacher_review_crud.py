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

def get_teacher_reviews_by_teacher_user_id(db: Session, teacher_user_id: int, skip: int = 0, limit: int = 100):
    """Get a list of reviews by teacher_user_id."""
    return db.query(TeacherReview).filter(TeacherReview.teacher_user_id == teacher_user_id).offset(skip).limit(limit).all()

def get_teacher_reviews_by_student_user_id(db: Session, tudent_user_id: int, skip: int = 0, limit: int = 100):
    """Get a list of reviews by student_user_id."""
    return db.query(TeacherReview).filter(TeacherReview.student_user_id == tudent_user_id).offset(skip).limit(limit).all()

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

def update_teacher_review(db: Session, db_obj: TeacherReview, obj_in: TeacherReviewUpdate):
    """Cập nhật thông tin review dựa trên db_obj."""
    update_data = obj_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_obj, key, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_teacher_review(db: Session, db_obj: TeacherReview):
    db.delete(db_obj)
    db.commit()
    return db_obj
