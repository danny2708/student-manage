from datetime import date
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, case, join, select, func
from app.models.evaluation_model import Evaluation, EvaluationType
from app.models.class_model import Class
from app.models.subject_model import Subject
from app.models.user_model import User
from app.schemas.evaluation_schema import EvaluationSummary, EvaluationView


def get_evaluations_by_student_user_id_forCal(
    db: Session, student_user_id: int, skip: int = 0, limit: int = 100
):
    """
    Lấy danh sách các bản ghi đánh giá chi tiết (delta) của một học sinh.
    """
    return (
        db.query(Evaluation)
        .filter(Evaluation.student_user_id == student_user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_evaluations_by_student_user_id(
    db: Session, student_user_id: int, skip: int = 0, limit: int = 100
) -> List[EvaluationView]:
    """
    Lấy danh sách evaluations của 1 học sinh, join với giáo viên, lớp và môn học.
    """
    teacher_user = User.__table__.alias("teacher_user")
    student_user = User.__table__.alias("student_user")
    classes = Class.__table__.alias("classes")
    subjects = Subject.__table__.alias("subjects")

    stmt = (
        select(
            Evaluation.evaluation_id,
            teacher_user.c.full_name.label("teacher_name"),
            student_user.c.full_name.label("student_name"),
            classes.c.class_name,
            subjects.c.name,
            Evaluation.evaluation_type,
            Evaluation.evaluation_date,
            Evaluation.evaluation_content,
        )
        .select_from(
            join(Evaluation, teacher_user, Evaluation.teacher_user_id == teacher_user.c.user_id)
        )
        .join(student_user, Evaluation.student_user_id == student_user.c.user_id)
        .join(classes, Evaluation.class_id == classes.c.class_id)
        .join(subjects, classes.c.subject_id == subjects.c.subject_id)
        .where(Evaluation.student_user_id == student_user_id)
        .offset(skip)
        .limit(limit)
    )

    result = db.execute(stmt).all()
    return [
        EvaluationView(
            id=row.evaluation_id,
            teacher=row.teacher_name,
            student=row.student_name,
            class_name=row.class_name,  # gộp lớp + môn
            type=row.evaluation_type,
            date=row.evaluation_date,
            content=row.evaluation_content,
        )
        for row in result
    ]


def get_all_evaluations_with_names(
    db: Session, skip: int = 0, limit: int = 100
) -> List[EvaluationView]:
    """
    Lấy tất cả evaluations, bao gồm teacher, student, class và subject.
    """
    teacher_user = User.__table__.alias("teacher_user")
    student_user = User.__table__.alias("student_user")
    classes = Class.__table__.alias("classes")
    subjects = Subject.__table__.alias("subjects")

    stmt = (
        select(
            Evaluation.evaluation_id,
            teacher_user.c.full_name.label("teacher_name"),
            student_user.c.full_name.label("student_name"),
            classes.c.class_name,
            subjects.c.name,
            Evaluation.evaluation_type,
            Evaluation.evaluation_date,
            Evaluation.evaluation_content,
        )
        .select_from(
            join(Evaluation, teacher_user, Evaluation.teacher_user_id == teacher_user.c.user_id)
        )
        .join(student_user, Evaluation.student_user_id == student_user.c.user_id)
        .join(classes, Evaluation.class_id == classes.c.class_id)
        .join(subjects, classes.c.subject_id == subjects.c.subject_id)
        .offset(skip)
        .limit(limit)
    )

    result = db.execute(stmt).all()
    return [
        EvaluationView(
            id=row.evaluation_id,
            teacher=row.teacher_name,
            student=row.student_name,
            class_name=f"{row.class_name} ({row.name})",
            type=row.evaluation_type,
            date=row.evaluation_date,
            content=row.evaluation_content,
        )
        for row in result
    ]


def get_evaluations_by_teacher_user_id(
    db: Session, teacher_user_id: int, skip: int = 0, limit: int = 100
) -> List[EvaluationView]:
    """
    Lấy các evaluations do một giáo viên tạo.
    """
    student_user = User.__table__.alias("student_user")
    classes = Class.__table__.alias("classes")
    subjects = Subject.__table__.alias("subjects")

    stmt = (
        select(
            Evaluation.evaluation_id,
            student_user.c.full_name.label("student_name"),
            classes.c.class_name,
            subjects.c.name,
            Evaluation.evaluation_type,
            Evaluation.evaluation_date,
            Evaluation.evaluation_content,
        )
        .select_from(
            join(Evaluation, student_user, Evaluation.student_user_id == student_user.c.user_id)
        )
        .join(classes, Evaluation.class_id == classes.c.class_id)
        .join(subjects, classes.c.subject_id == subjects.c.subject_id)
        .where(Evaluation.teacher_user_id == teacher_user_id)
        .offset(skip)
        .limit(limit)
    )

    result = db.execute(stmt).all()
    return [
        EvaluationView(
            id=row.evaluation_id,
            teacher="",  # chính là teacher_user_id hiện tại
            student=row.student_name,
            class_name=f"{row.class_name} ({row.name})",
            type=row.evaluation_type,
            date=row.evaluation_date,
            content=row.evaluation_content,
        )
        for row in result
    ]


def calculate_total_points_for_student(db: Session, student_user_id: int) -> Dict[str, Any]:
    """
    Tính tổng điểm học tập và kỷ luật của một học sinh (tất cả các lớp).
    """
    stmt = (
        select(
            func.sum(Evaluation.study_point).label("total_study_point"),
            func.sum(Evaluation.discipline_point).label("total_discipline_point"),
        )
        .where(Evaluation.student_user_id == student_user_id)
    )
    row = db.execute(stmt).first()
    return {
        "student_user_id": student_user_id,
        "final_study_point": 100 + row.total_study_point or 0,
        "final_discipline_point": 100 + row.total_discipline_point or 0,
    }


def summarize_end_of_semester(db: Session, student_user_id: int) -> Dict[str, Any]:
    """
    Tổng kết cuối kỳ (tất cả các lớp), giới hạn không quá 100.
    """
    total_points = calculate_total_points_for_student(db, student_user_id)
    return {
        "student_user_id": student_user_id,
        "final_study_point": min(total_points["total_study_point"], 100),
        "final_discipline_point": min(total_points["total_discipline_point"], 100),
    }

def get_evaluations_summary_by_student_in_class(
    db: Session,
    student_user_id: int,
    class_id: int
):
    """
    Trả về tổng kết điểm (study, discipline) của 1 học sinh trong 1 lớp.
    """
    stmt = (
        select(
            func.sum(Evaluation.study_point).label("final_study_point"),
            func.sum(Evaluation.discipline_point).label("final_discipline_point"),
            func.sum(case((Evaluation.study_point > 0, 1), else_=0)).label("study_plus_count"),
            func.sum(case((Evaluation.study_point < 0, 1), else_=0)).label("study_minus_count"),
            func.sum(case((Evaluation.discipline_point > 0, 1), else_=0)).label("discipline_plus_count"),
            func.sum(case((Evaluation.discipline_point < 0, 1), else_=0)).label("discipline_minus_count"),
            Class.class_name,
            Subject.subject_name.label("subject")
        )
        .join(Class, Evaluation.class_id == Class.id)
        .join(Subject, Evaluation.subject_id == Subject.id)
        .where(
            Evaluation.student_user_id == student_user_id,
            Evaluation.class_id == class_id
        )
        .group_by(Class.class_name, Subject.subject_name)
    )
    row = db.execute(stmt).first()
    if not row:
        return None

    return {
        "student_user_id": student_user_id,
        "class_name": row.class_name,
        "subject": row.subject,
        "final_study_point": row.final_study_point or 0,
        "final_discipline_point": row.final_discipline_point or 0,
        "study_plus_count": row.study_plus_count or 0,
        "study_minus_count": row.study_minus_count or 0,
        "discipline_plus_count": row.discipline_plus_count or 0,
        "discipline_minus_count": row.discipline_minus_count or 0,
    }


def get_evaluations_by_student_in_class(
    db: Session,
    student_user_id: int,
    class_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[EvaluationView]:
    """
    Lấy danh sách evaluations của một học sinh trong một lớp cụ thể.
    """
    teacher_user = User.__table__.alias("teacher_user")
    student_user = User.__table__.alias("student_user")
    classes = Class.__table__.alias("classes")
    subjects = Subject.__table__.alias("subjects")

    stmt = (
        select(
            Evaluation.evaluation_id.label("id"),
            classes.c.class_name.label("class_name"),
            student_user.c.full_name.label("student"),
            teacher_user.c.full_name.label("teacher"),
            Evaluation.evaluation_type.label("type"),
            Evaluation.evaluation_content.label("content"),
            Evaluation.evaluation_date.label("date"),
            subjects.c.name.label("subject"),
        )
        .select_from(
            join(Evaluation, teacher_user, Evaluation.teacher_user_id == teacher_user.c.user_id)
        )
        .join(student_user, Evaluation.student_user_id == student_user.c.user_id)
        .join(classes, Evaluation.class_id == classes.c.class_id)
        .join(subjects, classes.c.subject_id == subjects.c.subject_id)
        .where(
            and_(
                Evaluation.student_user_id == student_user_id,
                Evaluation.class_id == class_id
            )
        )
        .offset(skip)
        .limit(limit)
    )

    rows = db.execute(stmt).all()
    return [
        EvaluationView(
            id=row.id,
            class_name=f"{row.class_name} ({row.subject})",
            student=row.student,
            teacher=row.teacher,
            type=row.type,
            content=row.content,
            date=row.date,
        )
        for row in rows
    ]

def get_evaluations_summary_of_student_in_class(
    db: Session,
    student_user_id: int,
    class_id: int
) -> EvaluationSummary:
    """
    Lấy tổng kết điểm và số lần cộng/trừ điểm của một học sinh trong một lớp cụ thể.
    """
    # Aliases
    classes = Class.__table__.alias("classes")
    subjects = Subject.__table__.alias("subjects")
    
    # Lấy tất cả evaluations của học sinh trong lớp
    stmt = (
        select(
            Evaluation.study_point,
            Evaluation.discipline_point,
            classes.c.class_name,
            subjects.c.name.label("subject")
        )
        .select_from(
            join(Evaluation, classes, Evaluation.class_id == classes.c.class_id)
            .join(subjects, classes.c.subject_id == subjects.c.subject_id)
        )
        .where(
            and_(
                Evaluation.student_user_id == student_user_id,
                Evaluation.class_id == class_id
            )
        )
    )

    rows = db.execute(stmt).all()

    # Nếu không có evaluation nào, trả về mặc định
    if not rows:
        # Lấy tên lớp và môn
        class_info = db.query(Class, Subject).join(Subject).filter(Class.class_id == class_id).first()
        class_name = class_info.Class.class_name if class_info else ""
        subject_name = class_info.Subject.name if class_info else ""
        return EvaluationSummary(
            student_user_id=student_user_id,
            class_name=class_name,
            subject=subject_name,
            final_study_point=100,
            final_discipline_point=100,
            study_plus_count=0,
            study_minus_count=0,
            discipline_plus_count=0,
            discipline_minus_count=0
        )

    # Tính tổng điểm và số lần cộng/trừ
    total_study_point = 100
    total_discipline_point = 100
    study_plus_count = 0
    study_minus_count = 0
    discipline_plus_count = 0
    discipline_minus_count = 0

    for row in rows:
        total_study_point += row.study_point
        if row.study_point > 0:
            study_plus_count += 1
        elif row.study_point < 0:
            study_minus_count += 1

        total_discipline_point += row.discipline_point
        if row.discipline_point > 0:
            discipline_plus_count += 1
        elif row.discipline_point < 0:
            discipline_minus_count += 1

    return EvaluationSummary(
        student_user_id=student_user_id,
        class_name=rows[0].class_name,
        subject=rows[0].subject,
        final_study_point=min(total_study_point, 100),
        final_discipline_point=min(total_discipline_point, 100),
        study_plus_count=study_plus_count,
        study_minus_count=study_minus_count,
        discipline_plus_count=discipline_plus_count,
        discipline_minus_count=discipline_minus_count
    )

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