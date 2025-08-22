from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TuitionBase(BaseModel):
    student_id: int = Field(..., example=1, description="ID của học sinh")
    amount: float = Field(..., example=1500.00, description="Số tiền học phí")
    payment_date: date = Field(..., example="2023-10-26", description="Ngày thanh toán")
    term: int = Field(..., example=1, description="Kỳ học (ví dụ: học kỳ 1, học kỳ 2)")
    # is_paid không có trong DB, nếu cần thì phải xử lý ở logic backend hoặc thêm cột mới.
    # is_paid: bool = Field(False, example=True)

class TuitionCreate(TuitionBase):
    pass

class TuitionUpdate(BaseModel):
    # Các trường trong update nên là Optional vì người dùng có thể chỉ cập nhật một phần
    student_id: Optional[int] = None
    amount: Optional[float] = None
    payment_date: Optional[date] = None
    term: Optional[int] = None

class Tuition(TuitionBase):
    # Đổi tên từ 'id' thành 'tuition_id' để khớp với database
    tuition_id: int = Field(..., example=1, description="ID của bản ghi học phí")

    class Config:
        from_attributes = True

