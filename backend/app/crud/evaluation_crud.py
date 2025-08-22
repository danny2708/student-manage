# app/crud/evaluation_crud.py
from sqlalchemy.orm import Session
from app.models.evaluation_model import Evaluation
from app.schemas.evaluation_schema import EvaluationCreate

def get_evaluation(db: Session, evaluation_id: int):
    """
    Lấy thông tin đánh giá chi tiết (delta) theo ID.
    """
    return db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()

def get_evaluations_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """
    Lấy danh sách các bản ghi đánh giá chi tiết (delta) của một học sinh.
    """
    return db.query(Evaluation).filter(Evaluation.student_id == student_id).offset(skip).limit(limit).all()

def get_all_evaluations(db: Session, skip: int = 0, limit: int = 100):
    """
    Lấy danh sách tất cả bản ghi đánh giá chi tiết.
    """
    return db.query(Evaluation).offset(skip).limit(limit).all()

def create_evaluation(db: Session, evaluation: EvaluationCreate):
    """
    Tạo mới một bản ghi đánh giá chi tiết (delta).
    
    Dữ liệu đầu vào:
    - evaluation.study_point: sự thay đổi điểm học tập (+5, -1, ...).
    - evaluation.discipline_point: sự thay đổi điểm kỷ luật (+10, -5, ...).
    - evaluation.evaluation_content: lý do thay đổi điểm.
    """
    db_evaluation = Evaluation(**evaluation.model_dump())
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation

def delete_evaluation(db: Session, evaluation_id: int):
    """
    Xóa một bản ghi đánh giá chi tiết.
    """
    db_evaluation = db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()
    if db_evaluation:
        db.delete(db_evaluation)
        db.commit()
        return {"message": "Đã xóa thành công."}
    return {"message": "Đánh giá không tìm thấy."}
