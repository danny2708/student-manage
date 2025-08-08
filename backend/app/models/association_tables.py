from datetime import date
import enum

from sqlalchemy import Table, Column, Integer, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Bảng liên kết nhiều-nhiều giữa User và Role
# Sử dụng Table cho các liên kết đơn giản không cần thêm thuộc tính
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.user_id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.role_id'), primary_key=True)
)

# Bảng liên kết nhiều-nhiều giữa Student và Parent
# Tái cấu trúc thành một lớp ORM để có thể thực hiện CRUD một cách dễ dàng
class StudentParentAssociation(Base):
    __tablename__ = 'student_parents'

    student_id = Column(Integer, ForeignKey('students.student_id'), primary_key=True)
    parent_id = Column(Integer, ForeignKey('parents.parent_id'), primary_key=True)

    # Thêm các mối quan hệ (relationship)
    student = relationship("Student", back_populates="student_parent_associations")
    parent = relationship("Parent", back_populates="student_parent_associations")


# Enum cho trạng thái đăng ký của học sinh vào lớp học
class EnrollmentStatus(enum.Enum):
    """
    Các trạng thái đăng ký của học sinh vào lớp học.
    - 'Active': Đang học
    - 'OnLeave': Bảo lưu
    - 'Transferred': Chuyển trường
    - 'Graduated': Tốt nghiệp
    """
    Active = "Active"
    OnLeave = "OnLeave"
    Transferred = "Transferred"
    Graduated = "Graduated"


# Bảng liên kết nhiều-nhiều giữa Student và Class
class StudentClassAssociation(Base):
    __tablename__ = 'student_class'
    
    student_id = Column(Integer, ForeignKey('students.student_id'), primary_key=True)
    class_id = Column(Integer, ForeignKey('classes.class_id'), primary_key=True)
    enrollment_date = Column(Date, default=date.today(), nullable=False)
    status = Column(Enum(EnrollmentStatus), nullable=False, default=EnrollmentStatus.Active)
    
    student = relationship("Student", back_populates="student_class_associations")
    class_ = relationship("Class", back_populates="student_class_associations")
