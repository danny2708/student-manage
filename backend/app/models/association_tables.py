# backend/app/models/association_tables.py
from datetime import date
from sqlalchemy import Table, Column, Integer, ForeignKey, Enum, Date, String
from app.database import Base
import enum

# ---- User-Roles association ----
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.user_id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.role_id"), primary_key=True),
)

# ---- Student-Parent association (pure table) ----
student_parent_association = Table(
    "student_parent_association",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.student_id"), primary_key=True),
    Column("parent_id", Integer, ForeignKey("parents.parent_id"), primary_key=True),
)

# ---- Student-Class association ----
class EnrollmentStatus(enum.Enum):
    Active = "Active"
    Inactive = "Inactive"
    OnLeave = "OnLeave"
    Transferred = "Transferred"
    Graduated = "Graduated"

student_class_association = Table(
    "student_class_association",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.student_id"), primary_key=True),
    Column("class_id", Integer, ForeignKey("classes.class_id"), primary_key=True),
    Column("enrollment_date", Date, default=date.today),
    Column("status", Enum(EnrollmentStatus), nullable=False, default=EnrollmentStatus.Active),
)
