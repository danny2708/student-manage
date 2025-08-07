# app/models/student_model.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

# Import Base và bảng liên kết
from app.database import Base
from app.models.association_tables import student_parent_association, student_class_association

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    
    # Xóa cột class_id vì nó không thuộc bảng students

    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True)
    user = relationship("User", back_populates="student")

    # Mối quan hệ nhiều-nhiều với phụ huynh
    parents = relationship(
        "Parent",
        secondary=student_parent_association,
        back_populates="students"
    )

    # Mối quan hệ nhiều-nhiều với lớp học thông qua bảng liên kết
    classes = relationship(
        "Class",
        secondary=student_class_association,
        back_populates="students"
    )
