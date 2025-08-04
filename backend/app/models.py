from sqlalchemy import Column, Integer, String
from .database import Base

class Class(Base):
    __tablename__ = "classes"

    class_id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, nullable=False)
    teacher_id = Column(Integer, nullable=False)

class Teacher(Base):
    __tablename__ = "teachers"

    teacher_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(15), nullable=False)