from sqlalchemy.orm import Session
from datetime import date, datetime, timezone
from decimal import Decimal

from app.models.student_model import Student
from app.models.class_model import Class
from app.models.association_tables import student_class_association
from app.schemas.tuition_schema import TuitionCreate
from app.crud import tuition_crud
from app.models.tuition_model import Tuition, PaymentStatus
from app.crud import notification_crud
from app.schemas.notification_schema import NotificationCreate
from app.crud import student_crud

def calculate_tuition_for_student(db: Session, student_id: int) -> Decimal:
    """
    Tính học phí cho 1 học sinh dựa trên số lớp học sinh đó đang theo học.
    Công thức: Tổng học phí = SUM(fee của mỗi lớp).
    """
    student_classes = (
        db.query(Class)
        .join(student_class_association)
        .filter(student_class_association.c.student_id == student_id)
        .all()
    )

    if not student_classes:
        return Decimal(0)

    total_tuition = Decimal(0)
    for cls in student_classes:
        total_tuition += cls.fee

    return total_tuition


def create_tuition_record_for_student(
    db: Session, student_id: int, term: int, due_date: date
):
    """
    Tạo một bản ghi học phí mới cho học sinh sau khi tính toán.
    - Mặc định payment_status = "unpaid"
    - payment_date = None (vì chưa thanh toán)
    """
    tuition_amount = calculate_tuition_for_student(db, student_id)

    if tuition_amount <= Decimal(0):
        return None

    tuition_data = TuitionCreate(
        student_id=student_id,
        amount=float(tuition_amount),  # ép về float cho schema
        term=term,
        due_date=due_date,
    )

    db_tuition = tuition_crud.create_tuition(db, tuition=tuition_data)
    return db_tuition


def create_tuition_for_all_students(db: Session, term: int, due_date: date):
    student_ids = db.query(Student.student_id)

    successful_creations = 0
    failed_creations = 0

    for student_id_tuple in student_ids:
        student_id = student_id_tuple[0]
        try:
            db_tuition = create_tuition_record_for_student(
                db, student_id=student_id, term=term, due_date=due_date
            )

            if db_tuition:
                successful_creations += 1

                # Lấy tên học sinh
                student, student_user = student_crud.get_student_with_user(db, student_id)
                if not student_user:
                    continue
                student_name = student_user.full_name

                # 🔔 Gửi thông báo cho tất cả phụ huynh
                parents_with_users = student_crud.get_parents_by_student_id(db, student_id)
                for parent, parent_user in parents_with_users:
                    if parent_user:
                        notification_in = NotificationCreate(
                            sender_id=None,  # hệ thống
                            receiver_id=parent_user.user_id,
                            content=f"Học phí kỳ {term} của học sinh {student_name} "
                                    f"là {db_tuition.amount}, hạn nộp: {due_date}.",
                            sent_at=datetime.now(timezone.utc),
                            type="tuition"
                        )
                        notification_crud.create_notification(db, notification_in)

        except Exception as e:
            failed_creations += 1
            print(f"Lỗi khi tạo học phí cho sinh viên ID {student_id}: {e}")
            db.rollback()

    try:
        db.commit()
    except Exception as e:
        print(f"Lỗi trong quá trình commit cuối cùng: {e}")
        db.rollback()

    print(f"--- KẾT QUẢ TẠO HỌC PHÍ ---")
    print(f"Thành công: {successful_creations} bản ghi")
    print(f"Thất bại/Lỗi: {failed_creations} bản ghi")
    print(f"--------------------------")


def update_overdue_tuitions(db: Session):
    """Cập nhật trạng thái của các khoản học phí đã quá hạn."""
    today = date.today()
    
    # Tìm tất cả các bản ghi học phí "unpaid" mà due_date đã qua
    overdue_tuitions = db.query(Tuition).filter(
        Tuition.payment_status == PaymentStatus.unpaid,
        Tuition.due_date < today
    ).all()
    
    updated_count = 0
    for tuition in overdue_tuitions:
        tuition.payment_status = PaymentStatus.overdue
        updated_count += 1
    
    if updated_count > 0:
        db.commit()
    
    print(f"Đã cập nhật {updated_count} bản ghi học phí thành 'overdue'.")