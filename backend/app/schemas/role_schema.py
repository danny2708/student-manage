# app/schemas/role_schema.py
from pydantic import BaseModel

# Schema cơ bản để đọc dữ liệu Role
class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    pass

# Schema dùng để trả về dữ liệu Role, có thêm role_id
class Role(RoleBase):
    role_id: int

    class Config:
        from_attributes = True
