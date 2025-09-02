from sqlalchemy.orm import Session
from datetime import date
from app.models.tuition_model import Tuition, PaymentStatus
from app.schemas.tuition_schema import TuitionCreate, TuitionUpdate

def get_tuition(db: Session, tuition_id: int):
    return db.query(Tuition).filter(Tuition.tuition_id == tuition_id).first()


def get_tuitions_by_student_user_id(db: Session, student_user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Tuition)
        .filter(Tuition.student_user_id == student_user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_tuitions_by_parent_id(db: Session, parent_id: int, skip: int = 0, limit: int = 100):
    """
    Lấy tất cả học phí của các học sinh thuộc về một phụ huynh.
    """
    return (
        db.query(Tuition)
        .join(Tuition.student)  # dùng quan hệ Tuition → Student
        .filter(Tuition.student.has(parent_id=parent_id))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_tuitions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tuition).offset(skip).limit(limit).all()


def create_tuition(db: Session, tuition: TuitionCreate):
    """
    Tạo học phí (thuần DB, không gửi thông báo).
    Service sẽ gọi hàm này và chịu trách nhiệm gửi notification.
    """
    db_tuition = Tuition(
        **tuition.model_dump(),
        payment_status=PaymentStatus.unpaid
    )
    db.add(db_tuition)
    db.commit()
    db.refresh(db_tuition)
    return db_tuition


def update_tuition_details(db: Session, tuition_id: int, tuition_update: TuitionUpdate):
    """Cập nhật các chi tiết về học phí như amount, term, due_date."""
    db_tuition = get_tuition(db, tuition_id)
    if not db_tuition:
        return None

    # Không cho phép cập nhật nếu đã thanh toán
    if db_tuition.payment_status == PaymentStatus.paid:
        return None  # Router có thể raise HTTPException

    update_data = tuition_update.model_dump(exclude_unset=True)

    # Không cho thay đổi student_user_id
    update_data.pop("student_user_id", None)

    for key, value in update_data.items():
        setattr(db_tuition, key, value)

    db.commit()
    db.refresh(db_tuition)
    return db_tuition


def update_tuition_payment_status(db: Session, tuition_id: int, new_status: PaymentStatus):
    """Cập nhật trạng thái thanh toán và ngày thanh toán."""
    db_tuition = get_tuition(db, tuition_id)
    if not db_tuition:
        return None

    if db_tuition.payment_status == PaymentStatus.unpaid and new_status == PaymentStatus.paid:
        db_tuition.payment_status = PaymentStatus.paid
        db_tuition.payment_date = date.today()
    elif db_tuition.payment_status == PaymentStatus.paid and new_status == PaymentStatus.unpaid:
        # Cho phép hủy thanh toán
        db_tuition.payment_status = PaymentStatus.unpaid
        db_tuition.payment_date = None

    db.commit()
    db.refresh(db_tuition)
    return db_tuition


def delete_tuition(db: Session, tuition_id: int):
    db_tuition = get_tuition(db, tuition_id)
    if db_tuition:
        db.delete(db_tuition)
        db.commit()
    return db_tuition
