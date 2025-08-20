# app/crud/sheet_import_user_crud.py

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import re

from app.schemas.user_schema import UserCreate
from app.schemas.user_role_schema import UserRoleCreate
from app.schemas.student_schema import StudentCreate
from app.schemas.parent_schema import ParentCreate
from app.schemas.student_parent_schema import StudentParentAssociationCreate

from app.crud.user_crud import create_user
from app.crud.user_role_crud import create_user_role
from app.crud.student_crud import create_student
from app.crud.parent_crud import create_parent
from app.crud.student_parent_crud import create_student_parent


def _parse_date_safe(d: str):
    """
    Phân tích chuỗi ngày tháng với nhiều định dạng khác nhau.
    """
    if not isinstance(d, str):
        return None
    d = d.strip()
    if not d:
        return None
    
    # Updated formats to handle time part
    # "%Y-%m-%d %H:%M:%S" for '1969-09-06 00:00:00'
    for fmt in ("%Y-%m-%d %H:%M:%S", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d/%m/%y", "%m/%d/%y"):
        try:
            # For formats with time, we need to convert to date
            return datetime.strptime(d, fmt).date()
        except ValueError:
            continue
    return None

def _convert_excel_date(excel_date: float):
    """
    Chuyển đổi ngày tháng từ định dạng số của Excel sang datetime.date.
    """
    if not isinstance(excel_date, (int, float)):
        return None
    try:
        # Excel's base date is 1900-01-01
        # Subtracting 25569 (for Windows) to get correct date from epoch
        base_date = datetime(1900, 1, 1)
        # Handle leap year bug in Excel by checking for values > 60
        if excel_date > 60:
            return base_date + timedelta(days=int(excel_date - 2))
        else:
            return base_date + timedelta(days=int(excel_date - 1))
    except Exception:
        return None


def import_students(db: Session, student_rows: list) -> dict:
    """
    Import học sinh từ sheet (đã cắt cột A ở service).
    Trả về dict mapping email(lower) -> student_id.
    Cột sau khi cắt: 0:B(email), 1:C(full_name), 2:D(dob), 3:E(gender), 4:F(phone).
    """
    email_to_student_id = {}
    
    for row in student_rows:
        if not row:
            continue
        row = list(row) + [""] * (5 - len(row))
        
        email = (row[0] or "").strip().lower()
        full_name = (row[1] or "").strip()
        dob_raw = row[2]
        gender = (row[3] or "").strip()
        phone_number = (row[4] or "").strip()

        if not email or "@" not in email:
            continue

        username = email.split("@")[0]
        raw_password = username + "123"

        dob_parsed = None
        if isinstance(dob_raw, (int, float)):
            dob_parsed = _convert_excel_date(dob_raw)
        elif isinstance(dob_raw, str):
            dob_parsed = _parse_date_safe(dob_raw)
        
        # Tạo user
        user_in = UserCreate(
            username=username,
            full_name=full_name,
            email=email,
            password=raw_password,
            date_of_birth=dob_parsed,
            gender=gender,
            phone_number=phone_number,
        )
        db_user = create_user(db, user_in)
        
        # Gán role student
        create_user_role(db, UserRoleCreate(user_id=db_user.user_id, role_name="student"))
        
        # Tạo student record
        student_in = StudentCreate(user_id=db_user.user_id)
        db_student = create_student(db, student_in)
        
        email_to_student_id[email] = db_student.student_id

    return email_to_student_id


def import_parents(db: Session, parent_rows: list, email_to_student_id: dict) -> dict:
    """
    Import phụ huynh từ sheet (đã cắt cột A ở service).
    Trả về dict mapping email(lower) -> parent_id.
    Đồng thời gắn quan hệ Parent–Student nếu có child_email (cột I).
    Cột sau khi cắt: 0:B(email), 1:C(full_name), 2:D(dob), 3:E(gender),
                     4:F(phone), 5:G(...), 6:H(...), 7:I(child_email)
    """
    email_to_parent_id = {}
    
    for row in parent_rows:
        if not row:
            continue
        row = list(row) + [""] * (8 - len(row))

        email = (row[0] or "").strip().lower()  # B
        full_name = (row[1] or "").strip()  # C
        dob_raw = row[2]  # D
        gender = (row[3] or "").strip()  # E
        phone_number = (row[4] or "").strip()  # F
        child_email = (row[7] or "").strip().lower()  # I

        if not email or "@" not in email:
            continue

        username = email.split("@")[0]
        raw_password = username + "123"

        dob_parsed = None
        if isinstance(dob_raw, (int, float)):
            dob_parsed = _convert_excel_date(dob_raw)
        elif isinstance(dob_raw, str):
            dob_parsed = _parse_date_safe(dob_raw)

        # Tạo user phụ huynh
        user_in = UserCreate(
            username=username,
            full_name=full_name,
            email=email,
            password=raw_password,
            date_of_birth=dob_parsed,
            gender=gender,
            phone_number=phone_number,
        )
        db_user = create_user(db, user_in)
        
        # Gán role parent
        create_user_role(db, UserRoleCreate(user_id=db_user.user_id, role_name="parent"))

        # Tạo parent record
        parent_in = ParentCreate(user_id=db_user.user_id)
        db_parent = create_parent(db, parent_in)
        email_to_parent_id[email] = db_parent.parent_id
        
        # Liên kết parent–student (nếu có child_email hợp lệ & đã import ở students)
        if child_email and "@" in child_email:
            student_id = email_to_student_id.get(child_email)
            if student_id:
                sp_in = StudentParentAssociationCreate(
                    student_id=student_id,
                    parent_id=db_parent.parent_id
                )
                create_student_parent(db, sp_in)
                
    return email_to_parent_id
