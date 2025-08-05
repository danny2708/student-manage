from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    full_name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    gender = Column(String)
    class_id = Column(Integer, ForeignKey("classes.class_id"))
    parent_id = Column(Integer)