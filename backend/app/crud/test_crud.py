from sqlalchemy.orm import Session
from sqlalchemy import select
# Import mô hình Test và schemas đã được cập nhật
from app.models.test_model import Test
from app.models.class_model import Class
from app.schemas.test_schema import TestCreate, TestUpdate

def create_test(db: Session, test_in: TestCreate):
    db_class = db.get(Class, test_in.class_id)
    if not db_class:
        return None
    
    db_test = Test(
        test_name=test_in.test_name,
        student_user_id =test_in.student_user_id ,
        class_id=test_in.class_id,
        subject_id=db_class.subject_id,
        teacher_user_id=db_class.teacher_user_id,
        score=test_in.score,
        exam_date=test_in.exam_date
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

def update_test(db: Session, test_id: int, test_update: TestUpdate):
    db_test = db.query(Test).filter(Test.test_id == test_id).first()
    if not db_test:
        return None

    update_data = test_update.model_dump(exclude_unset=True)
    if "class_id" in update_data:
        new_class = db.get(Class, update_data["class_id"])
        if not new_class:
            return None
        db_test.subject_id = new_class.subject_id
        db_test.teacher_user_id = new_class.teacher_user_id

    for key, value in update_data.items():
        setattr(db_test, key, value)

    db.commit()
    db.refresh(db_test)
    return db_test

def get_test(db: Session, test_id: int):
    """Lấy thông tin bài kiểm tra theo ID."""
    stmt = select(Test).where(Test.test_id == test_id)
    return db.execute(stmt).scalars().first()

def get_tests_by_student_user_id (db: Session, student_user_id : int, skip: int = 0, limit: int = 100):
    """Lấy danh sách các bài kiểm tra theo student_user_id ."""
    stmt = select(Test).where(Test.student_user_id  == student_user_id ).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_tests_by_subject_id(db: Session, subject_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách các bài kiểm tra theo subject_id."""
    stmt = select(Test).where(Test.subject_id == subject_id).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_all_tests(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả các bài kiểm tra."""
    stmt = select(Test).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def delete_test(db: Session, db_obj: Test):
    """Xóa một bài kiểm tra dựa trên đối tượng Test đã truy vấn sẵn."""
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj
