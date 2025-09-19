# app/services/evaluation_service.py
from typing import List
from sqlalchemy.orm import Session
from app.crud import evaluation_crud
from app.schemas.evaluation_schema import EvaluationCreate, EvaluationView


def calculate_total_points_for_student(db: Session, student_user_id: int):
    """
    Tính tổng điểm học tập và kỷ luật hiện tại của một học sinh
    bằng cách cộng dồn tất cả các thay đổi điểm đã ghi lại.
    """
    # Lấy tất cả các bản ghi đánh giá chi tiết từ lớp CRUD
    evaluations = evaluation_crud.get_evaluations_by_student_user_id_forCal(db, student_user_id=student_user_id)
    
    total_study_point = sum(e.study_point for e in evaluations)
    total_discipline_point = sum(e.discipline_point for e in evaluations)
    
    return {
        "student_user_id": student_user_id,
        "total_study_point": total_study_point,
        "total_discipline_point": total_discipline_point,
    }

def create_new_evaluation(db: Session, evaluation_data: EvaluationCreate):
    """
    Tạo một bản ghi đánh giá mới với điểm delta và nội dung chi tiết.
    """
    return evaluation_crud.create_evaluation(db, evaluation=evaluation_data)

def summarize_end_of_semester(db: Session, student_user_id: int):
    """
    Tổng kết điểm cuối kỳ và cập nhật điểm, giới hạn không quá 100.
    """
    total_points = calculate_total_points_for_student(db, student_user_id=student_user_id)
    
    final_study_point = min(total_points['total_study_point'], 100)
    final_discipline_point = min(total_points['total_discipline_point'], 100)
    
    return {
        "student_user_id": student_user_id,
        "final_study_point": final_study_point,
        "final_discipline_point": final_discipline_point
    }

def get_summary_and_counts_for_student(db: Session, student_user_id: int):
    """
    Tính toán và trả về tổng kết điểm, giới hạn về 100,
    và đếm số lần cộng/trừ điểm cho cả điểm học tập và kỷ luật.
    """
    evaluations = evaluation_crud.get_evaluations_by_student_user_id_forCal(db, student_user_id=student_user_id)

    total_study_point = 100
    total_discipline_point = 100
    study_plus_count = 0
    study_minus_count = 0
    discipline_plus_count = 0
    discipline_minus_count = 0

    if not evaluations:
        return {
            "student_user_id": student_user_id,
            "final_study_point": 100,
            "final_discipline_point": 100,
            "study_plus_count": 0,
            "study_minus_count": 0,
            "discipline_plus_count": 0,
            "discipline_minus_count": 0,
        }

    for e in evaluations:
        total_study_point += e.study_point
        if e.study_point > 0:
            study_plus_count += 1
        elif e.study_point < 0:
            study_minus_count += 1
        
        total_discipline_point += e.discipline_point
        if e.discipline_point > 0:
            discipline_plus_count += 1
        elif e.discipline_point < 0:
            discipline_minus_count += 1

    final_study_point = min(total_study_point, 100)
    final_discipline_point = min(total_discipline_point, 100)
    
    return {
        "student_user_id": student_user_id,
        "final_study_point": final_study_point,
        "final_discipline_point": final_discipline_point,
        "study_plus_count": study_plus_count,
        "study_minus_count": study_minus_count,
        "discipline_plus_count": discipline_plus_count,
        "discipline_minus_count": discipline_minus_count,
    }