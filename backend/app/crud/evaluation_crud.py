from sqlalchemy.orm import Session
from app.models.evaluation_model import Evaluation
from app.schemas.evaluation_schema import EvaluationCreate, EvaluationUpdate

def get_evaluation(db: Session, evaluation_id: int):
    """Lấy thông tin đánh giá theo ID."""
    return db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()

def get_evaluations_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách đánh giá theo student_id."""
    return db.query(Evaluation).filter(Evaluation.student_id == student_id).offset(skip).limit(limit).all()

def get_all_evaluations(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả đánh giá."""
    return db.query(Evaluation).offset(skip).limit(limit).all()

def create_evaluation(db: Session, evaluation: EvaluationCreate):
    """Tạo mới một bản ghi đánh giá."""
    db_evaluation = Evaluation(**evaluation.model_dump())
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation

def update_evaluation(db: Session, evaluation_id: int, evaluation_update: EvaluationUpdate):
    """Cập nhật thông tin đánh giá."""
    db_evaluation = db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()
    if db_evaluation:
        update_data = evaluation_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_evaluation, key, value)
        db.add(db_evaluation)
        db.commit()
        db.refresh(db_evaluation)
    return db_evaluation

def delete_evaluation(db: Session, evaluation_id: int):
    """Xóa một bản ghi đánh giá."""
    db_evaluation = db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()
    if db_evaluation:
        db.delete(db_evaluation)
        db.commit()
    return db_evaluation

