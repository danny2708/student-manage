from typing import List, Optional
from datetime import datetime, date as dt_date, time as dt_time
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from app.crud import (
    attendance_crud,
    evaluation_crud,
    notification_crud,
    student_crud,
    class_crud,
    schedule_crud,
)
from app.schemas.attendance_schema import AttendanceBatchCreate
from app.schemas.evaluation_schema import EvaluationCreate
from app.schemas.notification_schema import NotificationCreate, NotificationUpdate
from app.models.attendance_model import Attendance, AttendanceStatus
from app.models.evaluation_model import EvaluationType
from app.models.notification_model import Notification, NotificationType
from app.models.schedule_model import Schedule, ScheduleTypeEnum, DayOfWeekEnum
from app.models.class_model import Class
from app.services import evaluation_service

def _resolve_schedule_for_class_and_date(
    db: Session, schedule_id: int, attendance_date: dt_date
) -> Optional[Schedule]:
    """
    Lấy lịch học hợp lệ cho lớp tại ngày attendance_date.
    Ưu tiên ONCE, nếu không có thì WEEKLY theo thứ.
    """
    # ONCE
    once = schedule_crud.search_schedules(db, schedule_id, ScheduleTypeEnum.ONCE, date=attendance_date)
    if once:
        return once[0]

    # WEEKLY
    dow_name = attendance_date.strftime("%A").upper()
    try:
        dow_enum = DayOfWeekEnum[dow_name]
    except KeyError:
        raise HTTPException(500, f"DayOfWeekEnum không khớp với ngày {attendance_date} ({dow_name})")

    weekly = schedule_crud.search_schedules(db, schedule_id, ScheduleTypeEnum.WEEKLY, day_of_week=dow_enum)
    if weekly:
        return weekly[0]
    return None

# ----------------- helper để chuẩn hóa time -----------------
def _to_naive_time(t: Optional[dt_time]) -> Optional[dt_time]:
    """
    Chuyển time (hoặc datetime.time/datetime) có tzinfo -> naive (loại bỏ tzinfo).
    Nếu t là None trả về None.
    """
    if t is None:
        return None

    # Nếu client gửi một datetime thay vì time (hiếm), lấy phần time
    if isinstance(t, datetime):
        t = t.time()

    tz = getattr(t, "tzinfo", None)
    if tz is not None:
        try:
            return t.replace(tzinfo=None)
        except Exception:
            # Nếu không thể replace (rất hiếm), fallback lấy giờ phút giây
            return dt_time(t.hour, t.minute, t.second, t.microsecond)
    return t

# ----------------- check permission (fix timezone compare) -----------------
def check_attendance_permission(
    db: Session,
    schedule_id: int,
    attendance_date: dt_date,
    checkin_time: Optional[dt_time],
    current_user,
) -> Schedule:
    """
    Kiểm tra quyền điểm danh và khung giờ:
    - schedule phải tồn tại
    - user phải là teacher của lớp
    - checkin_time (hoặc giờ hiện tại) phải nằm trong start_time..end_time của schedule
    Toàn bộ so sánh time đều được chuyển về naive để tránh lỗi offset-aware/naive.
    """
    schedule = schedule_crud.get_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch học.")
    if schedule.class_info.teacher_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bạn không được phép điểm danh cho lớp này.")

    # dùng checkin_time nếu có, nếu không dùng giờ hiện tại
    raw_check_time = checkin_time or datetime.now().time()

    # chuẩn hóa tất cả về naive
    time_to_check = _to_naive_time(raw_check_time)
    start_time_naive = _to_naive_time(schedule.start_time)
    end_time_naive = _to_naive_time(schedule.end_time)

    if start_time_naive is None or end_time_naive is None:
        # phòng trường hợp dữ liệu trong DB thiếu start/end
        raise HTTPException(status_code=500, detail="Lịch học thiếu thông tin giờ bắt đầu/kết thúc.")

    # kiểm tra thứ tự: nếu start > end (ví dụ qua nửa đêm) xử lý riêng (nếu cần)
    if start_time_naive <= end_time_naive:
        in_range = (start_time_naive <= time_to_check <= end_time_naive)
    else:
        # trường hợp lịch bắc qua nửa đêm: ví dụ start 22:00, end 02:00
        in_range = (time_to_check >= start_time_naive) or (time_to_check <= end_time_naive)

    if not in_range:
        raise HTTPException(
            status_code=403,
            detail=f"Bạn chỉ có thể điểm danh trong giờ học ({schedule.start_time} - {schedule.end_time})."
        )

    return schedule

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
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
from datetime import time as dt_time, datetime, date as dt_date
from fastapi import HTTPException
from app.models.class_model import Class

# ----------------- helper để chuẩn hóa time -----------------
def _to_naive_time(t: Optional[dt_time]) -> Optional[dt_time]:
    """
    Chuyển time (hoặc datetime.time/datetime) có tzinfo -> naive (loại bỏ tzinfo).
    Nếu t là None trả về None.
    """
    if t is None:
        return None

    # Nếu client gửi một datetime thay vì time (hiếm), lấy phần time
    if isinstance(t, datetime):
        t = t.time()

    tz = getattr(t, "tzinfo", None)
    if tz is not None:
        try:
            return t.replace(tzinfo=None)
        except Exception:
            # Nếu không thể replace (rất hiếm), fallback lấy giờ phút giây
            return dt_time(t.hour, t.minute, t.second, t.microsecond)
    return t

# ----------------- check permission (fix timezone compare) -----------------
def check_attendance_permission(
    db: Session,
    schedule_id: int,
    attendance_date: dt_date,
    checkin_time: Optional[dt_time],
    current_user,
) -> Schedule:
    """
    Kiểm tra quyền điểm danh và khung giờ:
    - schedule phải tồn tại
    - user phải là teacher của lớp
    - checkin_time (hoặc giờ hiện tại) phải nằm trong start_time..end_time của schedule
    Toàn bộ so sánh time đều được chuyển về naive để tránh lỗi offset-aware/naive.
    """
    schedule = schedule_crud.get_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch học.")
    if schedule.class_info.teacher_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bạn không được phép điểm danh cho lớp này.")

    # dùng checkin_time nếu có, nếu không dùng giờ hiện tại
    raw_check_time = checkin_time or datetime.now().time()

    # chuẩn hóa tất cả về naive
    time_to_check = _to_naive_time(raw_check_time)
    start_time_naive = _to_naive_time(schedule.start_time)
    end_time_naive = _to_naive_time(schedule.end_time)

    if start_time_naive is None or end_time_naive is None:
        # phòng trường hợp dữ liệu trong DB thiếu start/end
        raise HTTPException(status_code=500, detail="Lịch học thiếu thông tin giờ bắt đầu/kết thúc.")

    # kiểm tra thứ tự: nếu start > end (ví dụ qua nửa đêm) xử lý riêng (nếu cần)
    if start_time_naive <= end_time_naive:
        in_range = (start_time_naive <= time_to_check <= end_time_naive)
    else:
        # trường hợp lịch bắc qua nửa đêm: ví dụ start 22:00, end 02:00
        in_range = (time_to_check >= start_time_naive) or (time_to_check <= end_time_naive)

    if not in_range:
        raise HTTPException(
            status_code=403,
            detail=f"Bạn chỉ có thể điểm danh trong giờ học ({schedule.start_time} - {schedule.end_time})."
        )

    return schedule

# ----------------- create_batch_attendance (fix enum compare + timezone) -----------------
def create_batch_attendance(
    db: Session, attendance_data: AttendanceBatchCreate, current_user
) -> List[Attendance]:
    """
    Tạo các bản ghi điểm danh ban đầu cho một lớp.
    Nếu sinh viên vắng, tạo thông báo và bản ghi đánh giá.
    """
    now_time = datetime.now().time()

    # Gán giờ check-in cho các bản ghi present nếu client không gửi checkin_time
    for record in attendance_data.records:
        # SO SÁNH ENUM trực tiếp (không dùng .value)
        if record.status == AttendanceStatus.present and record.checkin_time is None:
            record.checkin_time = now_time

    # Lấy 1 checkin_time đại diện từ payload (nếu có) và chuẩn hóa
    representative_checkin: Optional[dt_time] = None
    for r in attendance_data.records:
        if r.checkin_time is not None:
            representative_checkin = _to_naive_time(r.checkin_time)
            break

    # Kiểm tra permission & khung giờ (check_attendance_permission sẽ lấy giờ hiện tại nếu rep_checkin=None)
    check_attendance_permission(
        db=db,
        schedule_id=attendance_data.schedule_id,
        attendance_date=attendance_data.attendance_date,
        checkin_time=representative_checkin,
        current_user=current_user,
    )

    schedule = schedule_crud.get_schedule(db, attendance_data.schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch học.")

    # Sử dụng schedule.class_id để lấy class_info
    class_info = class_crud.get_class(db, schedule.class_id)
    if not class_info:
        # Lỗi này chỉ xảy ra khi data trong DB không nhất quán
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học liên kết với lịch trình.")

    # Lấy teacher của lớp (phục vụ tạo evaluation)
    teacher_user_id = class_info.teacher_user_id

    # Tạo bản ghi điểm danh (CRUD sẽ insert enum trực tiếp)
    try:
        db_records = attendance_crud.create_initial_attendance_records(db, attendance_data)
    except ValueError as e:
        # propagate lỗi của CRUD (trùng bản ghi, thiếu SV, ...)
        raise HTTPException(status_code=400, detail=str(e))

    # Hậu xử lý: với những record vắng -> notification + evaluation
    for record in db_records:
        # record.status là enum AttendanceStatus (nếu model của bạn dùng SQLAlchemy Enum)
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
                    is_read=False,
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
                        is_read=False,
                    )
                    notification_crud.create_notification(db, notification=notification_parent)

            # Tạo evaluation trừ điểm
            evaluation_data = EvaluationCreate(
                student_user_id=record.student_user_id,
                teacher_user_id=teacher_user_id,
                class_id=class_info.class_id,  
                study_point=-5,
                discipline_point=-5,
                evaluation_content="Vắng mặt không phép trong buổi học.",
                evaluation_type=EvaluationType.discipline,
            )
            evaluation_crud.create_evaluation(db, evaluation=evaluation_data, teacher_user_id=teacher_user_id)

    return db_records

def update_late_attendance(
    db,
    student_user_id: int,
    schedule_id: int,
    checkin_time: datetime.time,
    attendance_date: datetime.date,
    current_user,
) -> Optional[Attendance]:

    check_attendance_permission(
        db=db,
        schedule_id=schedule_id,
        attendance_date=attendance_date,
        checkin_time=checkin_time,
        current_user=current_user,
    )

    attendance_record = (
        db.query(Attendance)
        .options(
            joinedload(Attendance.schedule).joinedload(Schedule.class_info)
        )
        .filter(
            Attendance.student_user_id == student_user_id,
            Attendance.schedule_id == schedule_id,
            Attendance.attendance_date == attendance_date,
        )
        .first()
    )

    if not attendance_record or attendance_record.status != AttendanceStatus.absent:
        return None

    updated_record = attendance_crud.update_attendance_status(
        db,
        db_record=attendance_record,
        new_status=AttendanceStatus.late,
        checkin_time=checkin_time,
    )

    if not attendance_record.schedule or not attendance_record.schedule.class_info:
        raise HTTPException(status_code=500, detail="Không tìm thấy thông tin lớp/giáo viên.")
    teacher_user_id = attendance_record.schedule.class_info.teacher_user_id

    evaluation_service.update_late_evaluation(
        db=db,
        student_user_id=student_user_id,
        teacher_user_id=teacher_user_id,
        attendance_date=attendance_date,
        new_content="Đi học muộn",
        study_point_penalty=-2,
        discipline_point_penalty=-2,
    )

    # Cập nhật notification phụ huynh nếu trước đó đã gửi 'vắng mặt'
    student, student_user = student_crud.get_student_with_user(db, student_user_id)
    if student and student_user:
        # Phụ huynh
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

        # Học sinh
        db_student_notification = db.query(Notification).filter(
            Notification.receiver_id == student_user.user_id,
            Notification.content.like(f"%vắng mặt%{attendance_record.attendance_date}%"),
        ).first()

        if db_student_notification:
            new_content = (
                f"Thông báo: Bạn đã đi học muộn trong buổi học ngày {attendance_record.attendance_date}."
            )
            notification_crud.update_notification(
                db=db,
                notification_id=db_student_notification.notification_id,
                notification_update=NotificationUpdate(content=new_content),
            )

    return updated_record


def get_attendances(
    db: Session,
    schedule_id: Optional[int] = None,
    current_user=None
) -> List[Attendance]:
    """
    Lấy danh sách attendance; nếu teacher -> lọc theo lớp dạy.
    """
    query = db.query(Attendance).join(Attendance.schedule).join(Schedule.class_info).options(
        joinedload(Attendance.student),
        joinedload(Attendance.schedule).joinedload(Schedule.class_info)
    )

    if schedule_id:
        query = query.filter(Attendance.schedule_id == schedule_id)

    if current_user and "teacher" in current_user.roles:
        query = query.filter(Class.teacher_user_id == current_user.user_id)

    return query.all()
