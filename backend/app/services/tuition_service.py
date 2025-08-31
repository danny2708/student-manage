# app/services/tuition_service.py
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.models.tuition_model import Tuition, PaymentStatus
from app.models.notification_model import NotificationType
from app.schemas.tuition_schema import TuitionCreate
from app.services.notification_service import send_notification
from app.crud.student_crud import get_student_with_user
from app.models.user_model import User
from app.models.student_model import Student
from app.models.class_model import Class
from app.models.association_tables import student_class_association
from decimal import Decimal
from app.database import SessionLocal


def create_tuition_record(db: Session, tuition_in: TuitionCreate):
    student, student_user = get_student_with_user(db, tuition_in.student_id)
    if not student or not student_user:
        raise ValueError("Student not found")

    # lookup phụ huynh
    parent = db.query(User).filter(User.user_id == student.parent_id).first()
    if not parent:
        raise ValueError("Parent not found")

    # tạo record học phí
    tuition_record = Tuition(
        student_id=tuition_in.student_id,
        amount=tuition_in.amount,
        term=tuition_in.term,
        due_date=tuition_in.due_date,
        payment_status=PaymentStatus.unpaid,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(tuition_record)
    db.commit()
    db.refresh(tuition_record)

    # gửi thông báo
    month_str = tuition_in.due_date.strftime("%m/%Y")
    content = (
        f"Học phí tháng {month_str} của học sinh {student_user.full_name} là "
        f"{tuition_in.amount} VND. Hạn thanh toán {tuition_in.due_date.strftime('%d/%m/%Y')}."
    )
    send_notification(
        db=db,
        sender_id=None,  # hệ thống gửi
        receiver_id=parent.user_id,
        content=content,
        notif_type=NotificationType.tuition,
    )

    return tuition_record


def calculate_tuition_for_student(db: Session, student_id: int) -> Decimal:
    student_classes = (
        db.query(Class)
        .join(student_class_association)
        .filter(student_class_association.c.student_id == student_id)
        .all()
    )
    total_tuition = Decimal(0)
    for cls in student_classes:
        total_tuition += cls.fee
    return total_tuition


def create_tuition_for_all_students(db: Session, term: int, due_date: date):
    students = db.query(Student).all()
    created_records = []

    for student in students:
        amount = calculate_tuition_for_student(db, student.student_id)
        if amount <= 0:
            continue

        tuition_record = Tuition(
            student_id=student.student_id,
            amount=amount,
            term=term,
            due_date=due_date,
            payment_status=PaymentStatus.unpaid,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(tuition_record)
        created_records.append(tuition_record)

        # gửi thông báo
        parent = db.query(User).filter(User.user_id == student.parent_id).first()
        student_user = db.query(User).filter(User.user_id == student.user_id).first()
        if parent and student_user:
            month_str = due_date.strftime("%m/%Y")
            content = (
                f"Học phí tháng {month_str} của học sinh {student_user.full_name} là "
                f"{amount} VND. Hạn thanh toán {due_date.strftime('%d/%m/%Y')}."
            )
            send_notification(
                db=db,
                sender_id=None,
                receiver_id=parent.user_id,
                content=content,
                notif_type=NotificationType.tuition,
            )

    db.commit()
    for record in created_records:
        db.refresh(record)
    return created_records
