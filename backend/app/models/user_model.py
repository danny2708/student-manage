# app/models/user_model.py
from sqlalchemy import Column, Integer, String, Enum
from app.database import Base
import enum # Import enum module

# Định nghĩa Enum cho các vai trò người dùng
class UserRole(enum.Enum):
    student = "student"
    teacher = "teacher"
    manager = "manager"
    parent = "parent"
    staff = "staff"
    # Bạn có thể thêm các vai trò khác nếu cần

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False) # Mật khẩu đã được băm
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False) # Sử dụng Enum cho role

    # Bạn có thể thêm các mối quan hệ (relationships) ở đây sau này
    # Ví dụ: students = relationship("Student", back_populates="user")
    # teachers = relationship("Teacher", back_populates="user")
    # managers = relationship("Manager", back_populates="user")
    # parents = relationship("Parent", back_populates="user")
    # staff_members = relationship("Staff", back_populates="user")

    def __repr__(self):
        return f"<User(user_id={self.user_id}, username='{self.username}', role='{self.role.value}')>"

