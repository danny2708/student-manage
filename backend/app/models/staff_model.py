from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False) # Đảm bảo cột này tồn tại
    name = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False) # Ví dụ: "admin", "hr", "accountant"
    date_of_birth = Column(Date, nullable=True)
    salary = Column(Float, nullable=True)

       
    user = relationship("User", backref="staff_member")

    def __repr__(self):
        return f"<Staff(staff_id={self.staff_id}, name='{self.name}', role='{self.role}')>"

    