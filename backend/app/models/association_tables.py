# app/models/association_tables.py
from sqlalchemy import Table, Column, Integer, ForeignKey
from app.database import Base

# Bảng liên kết nhiều-đối-nhiều giữa sinh viên và phụ huynh


# Bảng liên kết nhiều-đối-nhiều giữa người dùng và vai trò
user_roles = Table(
    'user_roles', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.user_id')),
    Column('role_id', Integer, ForeignKey('roles.role_id'))
)

student_parent_association = Table(
    'student_parent_association', Base.metadata,    
    Column('student_id', Integer, ForeignKey('students.student_id')),
    Column('parent_id', Integer, ForeignKey('parents.parent_id'))
)

student_class_association = Table(
    'student_class_association', Base.metadata,
    Column('student_id', Integer, ForeignKey('students.student_id'), primary_key=True),
    Column('class_id', Integer, ForeignKey('classes.class_id'), primary_key=True)
)
