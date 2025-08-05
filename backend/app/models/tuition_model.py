from sqlalchemy import Column, Integer, ForeignKey, Float, Date, String
from sqlalchemy.orm import relationship
from app.database import Base

class Tuition(Base):
    __tablename__ = "tuition"

    tuition_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String, nullable=False) # Ví dụ: "Paid", "Pending", "Overdue"
    sent_date = Column(Date, nullable=False) # Ngày gửi thông báo hoặc hóa đơn

    student = relationship("Student", backref="tuition_records")

