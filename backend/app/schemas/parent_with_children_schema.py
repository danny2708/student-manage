from pydantic import BaseModel, ConfigDict
from typing import List
from .parent_schema import ParentCreate
from .student_schema import StudentCreate

class ParentWithChildrenCreate(BaseModel):
    """
    Schema để đăng ký một Parent cùng với một hoặc nhiều Student.
    """
    parent_info: ParentCreate
    children_info: List[StudentCreate]

    model_config = ConfigDict(from_attributes=True)
