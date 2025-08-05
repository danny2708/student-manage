from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False) # Ví dụ: "admin", "counselor", "librarian"
    date_of_birth = Column(Date, nullable=False)
    salary = Column(Float, nullable=False)
    user = relationship("User", backref="staff_profile")