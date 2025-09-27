from datetime import date
from typing import List
from sqlalchemy import join, select
from sqlalchemy.orm import Session
from app.models.evaluation_model import Evaluation, EvaluationType
from app.schemas.evaluation_schema import EvaluationCreate, EvaluationView
from app.models.user_model import User

def get_evaluation(db: Session, evaluation_id: int):
    """
    Lấy thông tin đánh giá chi tiết (delta) theo ID.
    """
    return db.query(Evaluation).filter(Evaluation.evaluation_id == evaluation_id).first()

def get_evaluations_by_student_user_id(db: Session, student_user_id: int, skip: int = 0, limit: int = 100) -> List[EvaluationView]:
    """
    Lấy danh sách các bản ghi đánh giá chi tiết (delta) của một học sinh, bao gồm tên giáo viên.
    """
    teacher_user = User.__table__.alias("teacher_user")
    
    stmt = (
        select(
            Evaluation.evaluation_id,
            teacher_user.c.full_name.label("teacher_name"),
            Evaluation.evaluation_type,
            Evaluation.evaluation_date,
            Evaluation.evaluation_content
        )
        .select_from(
            join(Evaluation, teacher_user, Evaluation.teacher_user_id == teacher_user.c.user_id)
        )
        .where(Evaluation.student_user_id == student_user_id)
        .offset(skip)
        .limit(limit)
    )

    result = db.execute(stmt).all()
    evaluations_list = []
    for row in result:
        evaluations_list.append(
            EvaluationView(
                id=row.evaluation_id,
                teacher=row.teacher_name,
                student="", # Thay đổi None thành chuỗi rỗng
                type=row.evaluation_type,
                date=row.evaluation_date,
                content=row.evaluation_content
            )
        )
    return evaluations_list

def get_evaluations_by_student_user_id_forCal(db: Session, student_user_id: int, skip: int = 0, limit: int = 100):
    """
    Lấy danh sách các bản ghi đánh giá chi tiết (delta) của một học sinh.
    """
    return db.query(Evaluation).filter(Evaluation.student_user_id == student_user_id).offset(skip).limit(limit).all()

def get_all_evaluations(db: Session, skip: int = 0, limit: int = 100):
    """
    Lấy danh sách tất cả bản ghi đánh giá chi tiết.
    """
    return db.query(Evaluation).offset(skip).limit(limit).all()

def get_all_evaluations_with_names(db: Session, skip: int = 0, limit: int = 100) -> List[EvaluationView]:
    # Logic tương tự như hàm get_evaluations đã đề cập ở câu hỏi trước
    teacher_user = User.__table__.alias("teacher_user")
    student_user = User.__table__.alias("student_user")

    stmt = (
        select(
            Evaluation.evaluation_id,
            teacher_user.c.full_name.label("teacher_name"),
            student_user.c.full_name.label("student_name"),
            Evaluation.evaluation_type,
            Evaluation.evaluation_date,
            Evaluation.evaluation_content
        )
        .select_from(
            join(Evaluation, teacher_user, Evaluation.teacher_user_id == teacher_user.c.user_id)
        )
        .join(student_user, Evaluation.student_user_id == student_user.c.user_id)
        .offset(skip).limit(limit)
    )

    result = db.execute(stmt).all()
    evaluations_list = []
    for row in result:
        evaluations_list.append(
            EvaluationView(
                id=row.evaluation_id,
                teacher=row.teacher_name,
                student=row.student_name,
                type=row.evaluation_type,
                date=row.evaluation_date,
                content=row.evaluation_content
            )
        )
    return evaluations_list


def get_evaluations_by_teacher_user_id(db: Session, teacher_user_id: int, skip: int = 0, limit: int = 100) -> List[EvaluationView]:
    """
    Lấy các evaluations do một giáo viên cụ thể tạo, bao gồm tên học sinh.
    """
    student_user = User.__table__.alias("student_user")

    stmt = (
        select(
            Evaluation.evaluation_id,
            student_user.c.full_name.label("student_name"),
            Evaluation.evaluation_type,
            Evaluation.evaluation_date,
            Evaluation.evaluation_content
        )
        .select_from(
            join(Evaluation, student_user, Evaluation.student_user_id == student_user.c.user_id)
        )
        .where(Evaluation.teacher_user_id == teacher_user_id)
        .offset(skip)
        .limit(limit)
    )

    result = db.execute(stmt).all()
    evaluations_list = []
    for row in result:
        evaluations_list.append(
            EvaluationView(
                id=row.evaluation_id,
                teacher="", # Thay đổi None thành chuỗi rỗng
                student=row.student_name,
                type=row.evaluation_type,
                date=row.evaluation_date,
                content=row.evaluation_content
            )
        )
    return evaluations_list

def create_evaluation(db: Session, evaluation: EvaluationCreate, teacher_user_id: int):
    """
    Tạo mới một bản ghi đánh giá chi tiết (delta).
    
    Dữ liệu đầu vào:
    - evaluation.study_point: sự thay đổi điểm học tập (+5, -1, ...).
    - evaluation.discipline_point: sự thay đổi điểm kỷ luật (+10, -5, ...).
    - evaluation.evaluation_content: lý do thay đổi điểm.
    """
    db_evaluation = Evaluation(
        **evaluation.model_dump(),
        teacher_user_id=teacher_user_id
    )
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

def update_late_evaluation(
    db: Session,
    student_user_id: int,
    teacher_user_id: int,
    attendance_date: date,
    new_content: str,
    study_point_penalty: int = 0,
    discipline_point_penalty: int = 0,
    evaluation_type: EvaluationType = EvaluationType.discipline
) -> Evaluation:
    evaluation_record = db.query(Evaluation).filter(
        Evaluation.student_user_id == student_user_id,
        Evaluation.teacher_user_id == teacher_user_id,
        Evaluation.evaluation_type == evaluation_type,
        Evaluation.evaluation_date == attendance_date
    ).first()

    if evaluation_record:
        evaluation_record.evaluation_content = new_content
        evaluation_record.study_point = study_point_penalty
        evaluation_record.discipline_point = discipline_point_penalty
    else:
        evaluation_record = Evaluation(
            student_user_id=student_user_id,
            teacher_user_id=teacher_user_id,
            evaluation_date=attendance_date,
            evaluation_content=new_content,
            study_point=study_point_penalty,
            discipline_point=discipline_point_penalty,
            evaluation_type=evaluation_type
        )
        db.add(evaluation_record)

    db.commit()
    db.refresh(evaluation_record)
    return evaluation_record