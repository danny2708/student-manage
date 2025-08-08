from pydantic import BaseModel, Field

class SubjectBase(BaseModel):
    name: str = Field(..., example="Math")

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    id: int = Field(..., example=1)

class SubjectUpdate(SubjectBase):
    pass

    class Config:
        from_attributes = True