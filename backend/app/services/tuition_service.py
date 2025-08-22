from sqlalchemy.orm import Session
from datetime import date
from decimal import Decimal

from app.models.student_model import Student
from app.models.class_model import Class
from app.models.association_tables import student_class_association
from app.schemas.tuition_schema import TuitionCreate
from app.crud import tuition_crud
from app.models.tuition_model import Tuition, PaymentStatus

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
    """
    Lặp qua tất cả học sinh đang hoạt động và tạo bản ghi học phí cho họ.
    Hàm này được thiết kế để chạy dưới dạng background task.
    """
    # 1. Lấy danh sách ID của tất cả học sinh
    #    Chỉ lấy ID để tiết kiệm bộ nhớ
    student_ids = db.query(Student.student_id)

    successful_creations = 0
    failed_creations = 0
    
    # 2. Lặp qua từng ID học sinh để tạo học phí
    for student_id_tuple in student_ids:
        student_id = student_id_tuple[0]
        try:
            # 3. Tái sử dụng logic tạo học phí cho một học sinh
            db_tuition = create_tuition_record_for_student(
                db, student_id=student_id, term=term, due_date=due_date
            )
            
            # Nếu hàm trả về một bản ghi, tức là thành công
            if db_tuition:
                successful_creations += 1
            # Nếu hàm trả về None (do học phí <= 0), ta coi là một trường hợp "bỏ qua" chứ không phải lỗi
            
        except Exception as e:
            # 4. Ghi lại lỗi nếu có sự cố bất ngờ và rollback
            failed_creations += 1
            print(f"Lỗi khi tạo học phí cho sinh viên ID {student_id}: {e}")
            db.rollback() # Rất quan trọng: Ngăn chặn session bị lỗi

    # 5. Commit tất cả các thay đổi thành công sau khi vòng lặp kết thúc
    #    Lưu ý: Nếu có lỗi ở một học sinh, các học sinh trước đó vẫn được lưu
    #    nếu bạn không rollback toàn bộ. Cách tiếp cận này linh hoạt hơn.
    try:
        db.commit()
    except Exception as e:
        print(f"Lỗi trong quá trình commit cuối cùng: {e}")
        db.rollback()

    # Ghi log kết quả tổng quan
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