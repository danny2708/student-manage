# app/models/user_model.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import user_roles

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    # Định nghĩa mối quan hệ một-đến-một với các bảng vai trò cụ thể
    student = relationship("Student", back_populates="user", uselist=False)
    teacher = relationship("Teacher", back_populates="user", uselist=False)
    manager = relationship("Manager", back_populates="user", uselist=False)
    parent = relationship("Parent", back_populates="user", uselist=False)
    staff = relationship("Staff", back_populates="user", uselist=False)

    # Định nghĩa mối quan hệ nhiều-đến-nhiều với bảng Role
    roles = relationship(
        "Role", 
        secondary=user_roles, 
        back_populates="users"
    )

    def __repr__(self):
        return f"<User(user_id={self.user_id}, username='{self.username}')>"
