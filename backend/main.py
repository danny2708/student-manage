from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, engine
from backend.app import models
from backend.app.schemas import ClassCreate, TeacherCreate  # nhớ tạo file schemas.py

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/classes")
def create_class(class_data: ClassCreate, db: Session = Depends(get_db)):
    new_class = models.Class(
        class_id=class_data.class_id,
        class_name=class_data.class_name,
        teacher_id=class_data.teacher_id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

def create_teacher(teacher: TeacherCreate, db: Session = Depends(get_db)):
    new_teacher = models.Teacher(**teacher.dict())
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher