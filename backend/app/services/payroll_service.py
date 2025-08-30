from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.crud import payroll_crud, notification_crud
from app.schemas.payroll_schema import PayrollCreate, PayrollOut, PayrollUpdate
from app.schemas.notification_schema import NotificationCreate
from app.models.teacher_model import Teacher

def send_payroll_notification(db: Session, teacher, payroll):
    if not teacher.user_id:
        return None
    now = datetime.now(timezone.utc)
    content = f"Lương tháng {payroll.month}/{now.year} của bạn đã được tính. Tổng lương: {payroll.total:.2f}"

    notification_in = NotificationCreate(
    sender_id=None,
    receiver_id=teacher.user_id,
    content=content,
    type="payroll",
    )
    db_notification = notification_crud.create_notification(db, notification_in)

    db_notification = notification_crud.create_notification(db, notification_in)
    return {
        "notification_id": db_notification.notification_id,
        "receiver_id": teacher.user_id,
        "content": content,
        "sent_at": db_notification.sent_at,
    }

def create_payroll(db: Session, teacher: Teacher, payroll_in: PayrollCreate):
    today = datetime.now(timezone.utc)
    
    # Tính total từ base_salary + reward_bonus
    total_salary = payroll_in.base_salary + payroll_in.reward_bonus

    db_payroll = payroll_crud.create_payroll_record(db, payroll_in)

    content = f"Lương tháng {db_payroll.month}/{today.year} của bạn đã được tính. Tổng lương: {total_salary:.2f}"
    notification_in = NotificationCreate(
        receiver_id=teacher.user_id,
        content=content,
        type="payroll",
        sent_at=today
    )
    db_notification = notification_crud.create_notification(db, notification_in)

    return {
        "payroll_id": db_payroll.payroll_id,
        "teacher_id": db_payroll.teacher_id,
        "month": db_payroll.month,
        "base_salary": float(db_payroll.base_salary),
        "reward_bonus": float(db_payroll.reward_bonus),
        "total": total_salary,
        "sent_at": db_payroll.sent_at,
        "notification_id": db_notification.notification_id,
        "notification_content": db_notification.content,
        "notification_sent_at": db_notification.sent_at
    }

def run_monthly_payroll(db: Session):
    teachers = payroll_crud.get_all_teachers(db)
    today = datetime.now(timezone.utc)
    month = today.month
    year = today.year

    results = []

    for teacher in teachers:
        classes = payroll_crud.get_classes_taught_by_teacher(
            db, teacher.teacher_id, month=month, year=year
        )

        total_classes = len(classes)
        base_salary_per_class = payroll_crud.get_teacher_base_salary(db, teacher.teacher_id)
        reward_bonus = payroll_crud.get_teacher_reward_bonus(db, teacher.teacher_id)
        total_salary = total_classes * base_salary_per_class + reward_bonus

        payroll_in = PayrollCreate(
            teacher_id=teacher.teacher_id,
            month=month,
            base_salary=base_salary_per_class,
            reward_bonus=reward_bonus,
            total=total_salary,
            sent_at=today
        )

        # Chỉ gọi create_payroll, notification được tạo trong đó
        result = create_payroll(db, teacher, payroll_in)
        results.append(result)

    return results

def update_payroll_with_notification(db: Session, payroll_id: int, payroll_update: PayrollUpdate):
    db_payroll = payroll_crud.update_payroll(db, payroll_id, payroll_update)

    total_salary = db_payroll.base_salary + db_payroll.reward_bonus

    notification_in = NotificationCreate(
        content=f"Lương tháng {db_payroll.month}/{db_payroll.sent_at.year} của bạn đã được cập nhật. Tổng lương: {total_salary:.2f}",
        receiver_id=db_payroll.teacher.user_id,
        type="payroll"
    )
    notification = notification_crud.create_notification(db, notification_in)

    return PayrollOut(
        payroll_id=db_payroll.payroll_id,
        teacher_id=db_payroll.teacher_id,
        month=db_payroll.month,
        base_salary=db_payroll.base_salary,
        reward_bonus=db_payroll.reward_bonus,
        total=total_salary,
        sent_at=db_payroll.sent_at,
        notification_id=notification.notification_id,
        notification_content=notification.content,
        notification_sent_at=notification.sent_at
    )