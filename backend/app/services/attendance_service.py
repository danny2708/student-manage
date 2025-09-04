from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.crud import (
    attendance_crud,
    notification_crud,
    evaluation_crud,
    student_crud,
    class_crud,
    schedule_crud,
)
from app.schemas.attendance_schema import AttendanceBatchCreate
from app.schemas.notification_schema import NotificationCreate, NotificationUpdate
from app.schemas.evaluation_schema import EvaluationCreate
from app.models.attendance_model import AttendanceStatus, Attendance
from app.models.notification_model import Notification, NotificationType
from app.models.evaluation_model import EvaluationType
from app.models.schedule_model import Schedule, DayOfWeekEnum, ScheduleTypeEnum
from datetime import time as dt_time, datetime, date as dt_date, timedelta
from fastapi import HTTPException


def _resolve_schedule_for_class_and_date(
    db: Session, class_id: int, attendance_date: dt_date
) -> Optional[Schedule]:
    """
    Tìm lịch học hợp lệ của lớp tại ngày attendance_date:
      - Ưu tiên lịch ONCE khớp đúng ngày
      - Nếu không có, fallback lịch WEEKLY khớp theo thứ
    """
    # 1) Lịch ONCE theo ngày
    once_matches = schedule_crud.search_schedules(
        db=db,
        class_id=class_id,
        schedule_type=ScheduleTypeEnum.ONCE,
        date=attendance_date,
    )
    if once_matches:
        return once_matches[0]

    # 2) Lịch WEEKLY theo thứ
    # Chuyển attendance_date -> DayOfWeekEnum
    dow_name = attendance_date.strftime("%A").upper()  # e.g. 'THURSDAY'
    try:
        dow_enum = DayOfWeekEnum[dow_name]
    except KeyError:
        # Nếu enum khác format, báo lỗi rõ ràng
        raise HTTPException(
            status_code=500,
            detail=f"DayOfWeekEnum không khớp với ngày {attendance_date} ({dow_name}).",
        )

    weekly_matches = schedule_crud.search_schedules(
        db=db,
        class_id=class_id,
        schedule_type=ScheduleTypeEnum.WEEKLY,
        day_of_week=dow_enum,
    )
    if weekly_matches:
        return weekly_matches[0]

    return None


def check_attendance_permission(
    db: Session,
    class_id: int,
    attendance_date: dt_date,
    checkin_time: Optional[dt_time],
    current_user,
) -> Schedule:
    """
    Helper kiểm tra quyền điểm danh:
    - Giáo viên có dạy lớp không
    - Có lịch học hợp lệ không (WEEKLY hoặc ONCE)
    - Thời gian check-in nằm trong khoảng start - end của schedule
    """
    # 1) Giáo viên có dạy lớp không
    class_info = class_crud.get_class(db, class_id)
    if not class_info:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học.")
    if class_info.teacher_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bạn không được phép điểm danh cho lớp này.")

    # 2) Tìm lịch phù hợp (ONCE theo date, hoặc WEEKLY theo thứ)
    schedule = _resolve_schedule_for_class_and_date(db, class_id, attendance_date)
    if not schedule:
        raise HTTPException(status_code=400, detail="Không tìm thấy lịch học phù hợp.")

    # 3) Kiểm tra thời gian check-in
    #    - create batch: nếu record có checkin_time thì dùng; nếu không thì dùng thời gian hiện tại
    time_to_check = checkin_time or datetime.now().time()

    # (Optional) grace period nếu muốn nới thêm vài phút ở cuối buổi:
    # grace_minutes = 0
    # end_with_grace = (datetime.combine(datetime.today(), schedule.end_time) + timedelta(minutes=grace_minutes)).time()
    # in_range = schedule.start_time <= time_to_check <= end_with_grace

    in_range = schedule.start_time <= time_to_check <= schedule.end_time
    if not in_range:
        raise HTTPException(
            status_code=403,
            detail=f"Bạn chỉ có thể điểm danh trong giờ học "
                   f"({schedule.start_time.strftime('%H:%M:%S')} - {schedule.end_time.strftime('%H:%M:%S')}).",
        )

    return schedule


def create_batch_attendance(
    db: Session, attendance_data: AttendanceBatchCreate, current_user
) -> List[Attendance]:
    """
    Tạo các bản ghi điểm danh ban đầu cho một lớp.
    Nếu sinh viên vắng, tạo thông báo và bản ghi đánh giá.
    """
    # Lấy 1 checkin_time đại diện từ payload (nếu có)
    representative_checkin: Optional[dt_time] = None
    if attendance_data.records:
        for r in attendance_data.records:
            if r.checkin_time is not None:
                representative_checkin = r.checkin_time
                break

    # Kiểm tra permission & khung giờ
    check_attendance_permission(
        db=db,
        class_id=attendance_data.class_id,
        attendance_date=attendance_data.attendance_date,
        checkin_time=representative_checkin,  # có thì dùng, không thì dùng now trong helper
        current_user=current_user,
    )

    # Lấy teacher của lớp (phục vụ tạo evaluation)
    class_info = class_crud.get_class(db, attendance_data.class_id)
    if not class_info:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học với ID đã cung cấp.")
    teacher_user_id = class_info.teacher_user_id

    # Tạo bản ghi điểm danh
    try:
        db_records = attendance_crud.create_initial_attendance_records(db, attendance_data)
    except ValueError as e:
        # propagate lỗi của CRUD (trùng bản ghi, thiếu SV, ...)
        raise e

    # Hậu xử lý: với những record vắng -> notification + evaluation
    for record in db_records:
        if record.status == AttendanceStatus.absent:
            # Lấy thông tin student + user
            student_and_user_data = student_crud.get_student_with_user(db, record.student_user_id)

            if student_and_user_data:
                student, student_user = student_and_user_data

                # Gửi notify cho học sinh
                notification_student = NotificationCreate(
                    sender_id=None,
                    receiver_id=student.user_id,
                    content=f"Thông báo: Bạn đã vắng mặt trong buổi học ngày {record.attendance_date}.",
                    type=NotificationType.warning,
                )
                notification_crud.create_notification(db, notification=notification_student)

                # Gửi notify cho phụ huynh (nếu có)
                parent_and_user_tuple = student_crud.get_parent_by_user_id(db, record.student_user_id)
                if parent_and_user_tuple:
                    parent, parent_user = parent_and_user_tuple
                    notification_parent = NotificationCreate(
                        sender_id=None,
                        receiver_id=parent_user.user_id,
                        content=f"Thông báo: Con của bạn {student_user.full_name} đã vắng mặt trong buổi học ngày {record.attendance_date}.",
                        type=NotificationType.warning,
                    )
                    notification_crud.create_notification(db, notification=notification_parent)

            # Tạo evaluation trừ điểm
            evaluation_data = EvaluationCreate(
                student_user_id=record.student_user_id,
                teacher_user_id=teacher_user_id,
                study_point=-5,
                discipline_point=-5,
                evaluation_content="Vắng mặt không phép trong buổi học.",
                evaluation_type=EvaluationType.discipline,
            )
            # ⚠️ CRUD mới yêu cầu truyền teacher_user_id riêng -> đảm bảo tương thích
            evaluation_crud.create_evaluation(db, evaluation=evaluation_data, teacher_user_id=teacher_user_id)

    return db_records


def update_late_attendance(
    db: Session,
    student_user_id: int,
    class_id: int,
    checkin_time: dt_time,
    attendance_date: dt_date,
    current_user,
) -> Optional[Attendance]:
    """
    Cập nhật trạng thái điểm danh từ 'absent' sang 'late' khi sinh viên đến muộn.
    Chỉ khi:
      - Giáo viên dạy lớp đó
      - Trong khung giờ học của lịch hợp lệ
      - Bản ghi điểm danh của đúng NGÀY đó đang là 'absent'
    """
    # Kiểm tra permission & khung giờ
    check_attendance_permission(
        db=db,
        class_id=class_id,
        attendance_date=attendance_date,
        checkin_time=checkin_time,
        current_user=current_user,
    )

    # Lấy đúng bản ghi theo NGÀY
    attendance_record = attendance_crud.get_attendance_record_by_student_and_date(
        db, student_user_id=student_user_id, class_id=class_id, date=attendance_date
    )
    if not attendance_record:
        return None

    # Chỉ cho phép đổi từ 'absent' -> 'late'
    if attendance_record.status != AttendanceStatus.absent:
        # Không update nếu không phải absent
        return None

    # Cập nhật trạng thái attendance
    updated_record = attendance_crud.update_attendance_status(
        db,
        db_record=attendance_record,
        new_status=AttendanceStatus.late,
        checkin_time=checkin_time,
    )

    # Cập nhật evaluation (trừ điểm vì đi muộn)
    evaluation_crud.update_late_evaluation(
        db=db,
        student_user_id=student_user_id,
        teacher_user_id=attendance_record.class_obj.teacher_user_id,
        new_content="Đi học muộn",
        study_point_penalty=-2,
        discipline_point_penalty=-2,
    )

    # Cập nhật notification phụ huynh nếu trước đó đã gửi 'vắng mặt'
    student, student_user = student_crud.get_student_with_user(db, student_user_id)
    if student and student_user:
        parent, parent_user = student_crud.get_parent_by_user_id(db, student_user_id)
        if parent and parent_user:
            db_notification = db.query(Notification).filter(
                Notification.receiver_id == parent_user.user_id,
                Notification.content.like(f"%vắng mặt%{attendance_record.attendance_date}%"),
            ).first()

            if db_notification:
                new_content = (
                    f"Thông báo: Con của bạn {student_user.full_name} đi học muộn "
                    f"trong buổi học ngày {attendance_record.attendance_date}."
                )
                notification_crud.update_notification(
                    db=db,
                    notification_id=db_notification.notification_id,
                    notification_update=NotificationUpdate(content=new_content),
                )

    return updated_record
