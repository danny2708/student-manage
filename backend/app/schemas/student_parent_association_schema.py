from pydantic import BaseModel, ConfigDict
from typing import Optional

# Base schema chung để tái sử dụng
class StudentParentAssociationBase(BaseModel):
    """
    Schema cơ sở cho liên kết học sinh và phụ huynh.
    """
    student_id: int
    parent_id: int

# Schema cho việc tạo liên kết mới (được sử dụng trong POST request)
class StudentParentAssociationCreate(StudentParentAssociationBase):
    """
    Schema để tạo một liên kết học sinh-phụ huynh mới.
    """
    pass

# Schema cho việc cập nhật liên kết (được sử dụng trong PUT request)
class StudentParentAssociationUpdate(BaseModel):
    """
    Schema để cập nhật một liên kết học sinh-phụ huynh hiện có.
    Các trường là tùy chọn vì có thể chỉ cập nhật một trong hai.
    """
    student_id: Optional[int] = None
    parent_id: Optional[int] = None

# Schema cho response model (dữ liệu trả về từ API)
class StudentParent(StudentParentAssociationBase):
    """
    Schema đại diện cho một liên kết học sinh-phụ huynh khi được trả về từ API.
    Bao gồm ID của liên kết.
    """
    model_config = ConfigDict(from_attributes=True)
    id: int
