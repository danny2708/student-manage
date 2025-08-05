from sqlalchemy import Column, Integer, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Payroll(Base):
    __tablename__ = "payroll"

    payroll_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False) # Có thể liên kết với Staff hoặc Manager
    month = Column(Date, nullable=False) # Chỉ lưu tháng và năm
    base_salary = Column(Float, nullable=False)
    reward_bonus = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    sent_date = Column(Date, nullable=False)

    user = relationship("User", backref="payrolls")

