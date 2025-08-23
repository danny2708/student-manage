from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.crud import payroll_crud, teacher_crud, notification_crud
from app.schemas.payroll_schema import PayrollCreate
from app.schemas.notification_schema import NotificationCreate

def run_monthly_payroll(db: Session):
    """
    Tính toán và tạo bảng lương hàng tháng cho tất cả giáo viên,
    đồng thời gửi thông báo tới từng giáo viên.
    """
    teachers = payroll_crud.get_all_teachers(db)
    today = datetime.now(timezone.utc)
    month = today.month
    year = today.year

    results = []  # để lưu payroll + notification cho từng teacher

    for teacher in teachers:
        # Lấy số lớp mà giáo viên đã dạy trong tháng
        classes = payroll_crud.get_classes_taught_by_teacher(
            db, teacher.teacher_id, month=month, year=year
        )

        total_classes = len(classes)
        base_salary_per_class = payroll_crud.get_teacher_base_salary(db, teacher.teacher_id)
        reward_bonus = payroll_crud.get_teacher_reward_bonus(db, teacher.teacher_id)

        total_salary = total_classes * base_salary_per_class + reward_bonus

        # Tạo record payroll
        payroll_in = PayrollCreate(
            teacher_id=teacher.teacher_id,
            month=month,
            base_salary=base_salary_per_class,
            reward_bonus=reward_bonus,
            total=total_salary,
            sent_at=today
        )

        db_payroll = payroll_crud.create_payroll_record(db, payroll_in)

        notification_data = None
        if teacher.user_id:  # giả sử teacher có liên kết user_id
            content = (
                f"Lương tháng {month}/{year} của bạn đã được tính. "
                f"Tổng lương: {total_salary:.2f}"
            )
            notification_in = NotificationCreate(
                sender_id=None,  # hoặc ID admin hệ thống
                receiver_id=teacher.user_id,
                content=content,
                sent_at=today,
                type="payroll",
            )
            db_notification = notification_crud.create_notification(db, notification_in)
            notification_data = {
                "receiver_id": teacher.user_id,
                "content": content,
                "sent_at": today.isoformat(),
            }

        results.append({
            "teacher_id": teacher.teacher_id,
            "payroll": {
                "id": db_payroll.payroll_id,
                "month": db_payroll.month,
                "total": db_payroll.total,
            },
            "notification": notification_data
        })

    return results
