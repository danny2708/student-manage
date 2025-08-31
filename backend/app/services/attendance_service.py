# app/services/attendance_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud import attendance_crud, notification_crud, evaluation_crud, student_crud, class_crud
from app.schemas.attendance_schema import AttendanceBatchCreate
from app.schemas.notification_schema import NotificationCreate, NotificationUpdate
from app.schemas.evaluation_schema import EvaluationCreate
from app.models.attendance_model import AttendanceStatus, Attendance
from app.models.notification_model import  Notification, NotificationType
from app.models.evaluation_model import EvaluationType
from datetime import time, date
from fastapi import HTTPException

def create_batch_attendance(db: Session, attendance_data: AttendanceBatchCreate) -> List[Attendance]:
    """
    Tạo các bản ghi điểm danh ban đầu cho một lớp.
    Nếu sinh viên vắng, tạo thông báo và bản ghi đánh giá.
    Đã cập nhật để xử lý ngoại lệ từ attendance_crud.
    """
    class_info = class_crud.get_class(db, attendance_data.class_id)
    if not class_info:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học với ID đã cung cấp.")
        
    teacher_id = class_info.teacher_id

    try:
        db_records = attendance_crud.create_initial_attendance_records(db, attendance_data)
    except ValueError as e:
        raise e
    
    for record in db_records:
        if record.status == AttendanceStatus.absent:
            student_and_user_data = student_crud.get_student_with_user(db, record.student_id)
            
            if student_and_user_data:
                student, student_user = student_and_user_data
                
                notification_student = NotificationCreate(
                    sender_id=None,
                    receiver_id=student.user_id,
                    content=f"Thông báo: Bạn đã vắng mặt trong buổi học ngày {record.attendance_date}.",
                    type=NotificationType.warning
                )
                notification_crud.create_notification(db, notification=notification_student)
                
                parent_and_user_tuple = student_crud.get_parent_by_student_id(db, record.student_id)
                if parent_and_user_tuple:
                    parent, parent_user = parent_and_user_tuple
                    notification_parent = NotificationCreate(
                        sender_id=None,
                        receiver_id=parent_user.user_id,
                        content=f"Thông báo: Con của bạn {student_user.full_name} đã vắng mặt trong buổi học ngày {record.attendance_date}.",
                        type=NotificationType.warning
                    )
                    notification_crud.create_notification(db, notification=notification_parent)

            
            evaluation_data = EvaluationCreate(
                student_id=record.student_id,
                teacher_id=teacher_id,
                study_point=-5,
                discipline_point=-5,
                evaluation_content="Vắng mặt không phép trong buổi học.",
                evaluation_type=EvaluationType.discipline
            )
            
            evaluation_crud.create_evaluation(db, evaluation=evaluation_data)
    
    return db_records

def update_late_attendance(db: Session, student_id: int, class_id: int, checkin_time: time) -> Optional[Attendance]:
    attendance_record = attendance_crud.get_absent_attendance_for_student_in_class(db, student_id, class_id)
    if not attendance_record:
        return None

    # Cập nhật trạng thái attendance
    updated_record = attendance_crud.update_attendance_status(
        db,
        db_record=attendance_record,
        new_status=AttendanceStatus.late,
        checkin_time=checkin_time
    )

    # Cập nhật evaluation
    evaluation_crud.update_late_evaluation(
        db=db,
        student_id=student_id,
        teacher_id=attendance_record.class_obj.teacher_id,
        new_content="Đi học muộn",
        study_point_penalty=-2,         # trừ 2 điểm
        discipline_point_penalty=-2     # trừ 2 điểm
    )

    # Lấy học sinh và user
    student, student_user = student_crud.get_student_with_user(db, student_id)
    if student and student_user:
        # Lấy 1 phụ huynh duy nhất
        parent, parent_user = student_crud.get_parent_by_student_id(db, student_id)
        if parent and parent_user:
            # Tìm thông báo hiện tại của phụ huynh liên quan đến buổi học này
            db_notification = db.query(Notification).filter(
                Notification.receiver_id == parent_user.user_id,
                Notification.content.like(f"%vắng mặt%{attendance_record.attendance_date}%")
            ).first()

            if db_notification:
                # Cập nhật nội dung thông báo
                new_content = f"Thông báo: Con của bạn {student_user.full_name} đi học muộn trong buổi học ngày {attendance_record.attendance_date}."
                notification_crud.update_notification(
                    db=db,
                    notification_id=db_notification.notification_id,
                    notification_update=NotificationUpdate(content=new_content)
                )

    return updated_record
