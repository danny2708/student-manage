# backend/app/models/association_tables.py
from sqlalchemy import Table, Column, Integer, ForeignKey
from app.database import Base
import enum

# ---- User-Roles association ----
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.user_id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.role_id"), primary_key=True),
)

student_class_association = Table(
    "student_class_association",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.student_id"), primary_key=True),
    Column("class_id", Integer, ForeignKey("classes.class_id"), primary_key=True),
)
