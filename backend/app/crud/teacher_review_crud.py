from sqlalchemy.orm import Session
from backend.app.models.teacher_review_model import TeacherReview
from backend.app.schemas.teacher_review_schema import TeacherReviewCreate, TeacherReviewUpdate
import logging

logger = logging.getLogger(__name__)

def get_teacher_review(db: Session, review_id: int):
    """Lấy thông tin đánh giá giáo viên theo ID."""
    return db.query(TeacherReview).filter(TeacherReview.review_id == review_id).first()

def get_teacher_reviews_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách đánh giá theo teacher_id."""
    return db.query(TeacherReview).filter(TeacherReview.teacher_id == teacher_id).offset(skip).limit(limit).all()

def get_all_teacher_reviews(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả đánh giá giáo viên."""
    return db.query(TeacherReview).offset(skip).limit(limit).all()

def create_teacher_review(db: Session, teacher_review: TeacherReviewCreate):
    """Tạo mới một bản ghi đánh giá giáo viên."""
    db_teacher_review = TeacherReview(**teacher_review.model_dump())
    db.add(db_teacher_review)
    db.commit()
    db.refresh(db_teacher_review)
    return db_teacher_review

def update_teacher_review(db: Session, review_id: int, teacher_review_update: TeacherReviewUpdate):
    """Cập nhật thông tin đánh giá giáo viên."""
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
    """Xóa một bản ghi đánh giá giáo viên (lưu log trước khi xóa)."""
    db_teacher_review = db.query(TeacherReview).filter(TeacherReview.review_id == review_id).first()
    if db_teacher_review:
        # Lưu log thông tin trước khi xóa
        logger.info(
            f"Deleting TeacherReview: ID={db_teacher_review.review_id}, "
            f"TeacherID={db_teacher_review.teacher_id}, "
            f"StudentID={db_teacher_review.student_id}, "
            f"Rating={db_teacher_review.rating}, "
            f"ReviewText='{db_teacher_review.review_text}', "
            f"Timestamp={db_teacher_review.timestamp}"
        )
        db.delete(db_teacher_review)
        db.commit()
    return db_teacher_review
