# app/models/class_model.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.association_tables import student_class_association

class Class(Base):
    __tablename__ = "classes"

    class_id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String(50), nullable=False, unique=True)
    
    # Khóa ngoại đến bảng teachers
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"), nullable=True)

    # Mối quan hệ với Teacher, "teacher" là tên của thuộc tính trong Class
    # và "back_populates" trỏ đến thuộc tính "classes" trong Teacher
    teacher = relationship("Teacher", back_populates="classes")
    
    # Mối quan hệ nhiều-nhiều với học sinh thông qua bảng liên kết
    students = relationship(
        "Student",
        secondary=student_class_association,
        back_populates="classes"
    )
