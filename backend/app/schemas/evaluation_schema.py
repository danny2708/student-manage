from datetime import date
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from app.models.evaluation_model import EvaluationType

# Lớp cơ sở chứa các thuộc tính chung
class EvaluationBase(BaseModel):
    """
    Schema cơ sở cho mô hình Evaluation.
    """
    teacher_user_id: int
    student_user_id: int
    study_point: int
    discipline_point: int
    evaluation_type: EvaluationType
    evaluation_content: Optional[str] = None
    evaluation_date: date = date.today()

# Lớp dùng để tạo một bản ghi đánh giá mới
class EvaluationCreate(EvaluationBase):
    """
    Schema để tạo một bản ghi đánh giá mới.
    """
    pass

# Lớp dùng để đọc/trả về dữ liệu từ cơ sở dữ liệu
class EvaluationRead(EvaluationBase):
    """
    Schema để đọc dữ liệu đánh giá từ cơ sở dữ liệu.
    Bao gồm trường evaluation_id.
    """
    evaluation_id: int

# Lớp chính, cấu hình để tương thích với SQLAlchemy ORM
class Evaluation(EvaluationRead):
    """
    Schema chính cho mô hình Evaluation, dùng để tương tác với SQLAlchemy.
    """
    model_config = ConfigDict(from_attributes=True)

class EvaluationSummary(BaseModel):
    student_user_id: int
    final_study_point: int = Field(..., description="Tổng điểm học tập, giới hạn ở 100.")
    final_discipline_point: int = Field(..., description="Tổng điểm kỷ luật, giới hạn ở 100.")
    study_plus_count: int = Field(..., description="Số lần điểm học tập được cộng.")
    study_minus_count: int = Field(..., description="Số lần điểm học tập bị trừ.")
    discipline_plus_count: int = Field(..., description="Số lần điểm kỷ luật được cộng.")
    discipline_minus_count: int = Field(..., description="Số lần điểm kỷ luật bị trừ.")

    class Config:
        from_attributes = True
