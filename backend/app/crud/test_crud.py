from sqlalchemy.orm import Session
from sqlalchemy import select
# Import mô hình Test và schemas đã được cập nhật
from app.models.test_model import Test
from app.schemas.test_schema import TestCreate, TestUpdate

def get_test(db: Session, test_id: int):
    """Lấy thông tin bài kiểm tra theo ID."""
    stmt = select(Test).where(Test.test_id == test_id)
    return db.execute(stmt).scalars().first()

def get_tests_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách các bài kiểm tra theo student_id."""
    stmt = select(Test).where(Test.student_id == student_id).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_tests_by_subject_id(db: Session, subject_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách các bài kiểm tra theo subject_id."""
    stmt = select(Test).where(Test.subject_id == subject_id).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_all_tests(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả các bài kiểm tra."""
    stmt = select(Test).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_test(db: Session, test: TestCreate):
    """Tạo mới một bài kiểm tra."""
    db_test = Test(**test.model_dump())
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

def update_test(db: Session, test_id: int, test_update: TestUpdate):
    """Cập nhật thông tin bài kiểm tra."""
    db_test = db.query(Test).filter(Test.test_id == test_id).first()
    if db_test:
        update_data = test_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_test, key, value)
        db.add(db_test)
        db.commit()
        db.refresh(db_test)
    return db_test

def delete_test(db: Session, test_id: int):
    """Xóa một bài kiểm tra."""
    db_test = db.query(Test).filter(Test.test_id == test_id).first()
    if db_test:
        db.delete(db_test)
        db.commit()
    return db_test
