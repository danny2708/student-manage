from sqlalchemy.orm import Session
from app.models.score_model import Score
from app.schemas.score_schema import ScoreCreate, ScoreUpdate

def get_score(db: Session, score_id: int):
    """Lấy thông tin điểm số theo ID."""
    return db.query(Score).filter(Score.score_id == score_id).first()

def get_scores_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách điểm số theo student_id."""
    return db.query(Score).filter(Score.student_id == student_id).offset(skip).limit(limit).all()

def get_scores_by_subject_id(db: Session, subject_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách điểm số theo subject_id."""
    return db.query(Score).filter(Score.subject_id == subject_id).offset(skip).limit(limit).all()

def get_all_scores(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả điểm số."""
    return db.query(Score).offset(skip).limit(limit).all()

def create_score(db: Session, score: ScoreCreate):
    """Tạo mới một điểm số."""
    db_score = Score(**score.model_dump())
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

def update_score(db: Session, score_id: int, score_update: ScoreUpdate):
    """Cập nhật thông tin điểm số."""
    db_score = db.query(Score).filter(Score.score_id == score_id).first()
    if db_score:
        update_data = score_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_score, key, value)
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
    return db_score

def delete_score(db: Session, score_id: int):
    """Xóa một điểm số."""
    db_score = db.query(Score).filter(Score.score_id == score_id).first()
    if db_score:
        db.delete(db_score)
        db.commit()
    return db_score

