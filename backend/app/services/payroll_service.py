from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.crud import payroll_crud, notification_crud
from app.schemas.payroll_schema import PayrollCreate, PayrollUpdate, Payroll
from app.schemas.notification_schema import NotificationCreate
from app.models.teacher_model import Teacher
from app.models.payroll_model import PaymentStatus
from app.crud import teacher_crud

today = datetime.now(timezone.utc)
month = today.month
year = today.year

def create_payroll(db: Session, teacher: Teacher, payroll_in: PayrollCreate) -> Payroll:
    today = datetime.now(timezone.utc)

    db_payroll = payroll_crud.create_payroll_record(db, payroll_in)

    content = (
        f"Lương tháng {db_payroll.month}/{db_payroll.sent_at.year} của bạn đã được tính. "
        f"Tổng lương: {db_payroll.total:.2f}. "
        f"Thời gian: {db_payroll.sent_at.isoformat()}"
    )

    notification_in = NotificationCreate(
        receiver_id=teacher.user_id,
        content=content,
        type="payroll",
        sent_at=db_payroll.sent_at
    )
    db_notification = notification_crud.create_notification(db, notification_in)

    # Trả về đối tượng Pydantic đã được xác thực
    return Payroll.from_orm(db_payroll)
    
def run_monthly_payroll(db: Session) -> list[Payroll]:
    teachers = teacher_crud.get_all_teachers(db)

    results = []
    for teacher in teachers:
        classes = teacher_crud.get_classes_taught_by_teacher(
            db, teacher.user_id, month=month, year=year
        )
        total_classes = len(classes)
        base_salary_per_class = teacher_crud.get_teacher_base_salary(db, teacher.user_id) or 0.0
        reward_bonus = teacher_crud.get_teacher_reward_bonus(db, teacher.user_id) or 0.0

        payroll_in = PayrollCreate(
            teacher_user_id=teacher.user_id,
            month=month,
            total_base_salary=total_classes * base_salary_per_class,
            reward_bonus=reward_bonus,
            sent_at=today,
            status= PaymentStatus.pending  # Đảm bảo gán giá trị mặc định cho schema
        )
        result = create_payroll(db, teacher, payroll_in)
        results.append(result)

    return results

def update_payroll_with_notification(db: Session, payroll_id: int, payroll_update: PayrollUpdate) -> Payroll:
    db_payroll = payroll_crud.update_payroll(db, payroll_id, payroll_update)
    if not db_payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")

    notification_in = NotificationCreate(
        content=(
            f"Lương tháng {db_payroll.month}/{db_payroll.sent_at.year} của bạn đã được tính. "
            f"Tổng lương: {db_payroll.total:.2f}. "
            f"Thời gian: {db_payroll.sent_at.isoformat()}"
        ),
        receiver_id=db_payroll.teacher_user_id,
        type="payroll",
        sent_at=datetime.now(timezone.utc)
    )
    notification_crud.create_notification(db, notification_in)

    return Payroll.from_orm(db_payroll)