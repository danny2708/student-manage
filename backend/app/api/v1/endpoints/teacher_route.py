from sqlalchemy import Column, Integer, String
from app.database import Base

class Teacher(Base):
    __tablename__ = "teachers"

    teacher_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    full_name = Column(String)
    email = Column(String)
    phone_number = Column(String)
