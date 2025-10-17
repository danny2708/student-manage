from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, select
from app.models.test_model import Test
from app.models.class_model import Class
from app.schemas.test_schema import TestCreate, TestUpdate
from app.services.test_service import validate_student_enrollment
from app.schemas.auth_schema import AuthenticatedUser
from app.models.student_model import Student

def create_test(db: Session, test_in: TestCreate, current_user: AuthenticatedUser):
    db_class = db.get(Class, test_in.class_id)
    if not db_class:
        return None

    # Validate enrollment
    validate_student_enrollment(db, test_in.student_user_id, test_in.class_id)

    # Nếu user là teacher -> chỉ được tạo test cho lớp của mình
    if "teacher" in current_user.roles and db_class.teacher_user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Teacher {current_user.user_id} không có quyền tạo test cho class {test_in.class_id}"
        )

    # Check trùng test (student_id + test_name)
    duplicate = db.query(Test).filter(
        Test.student_user_id == test_in.student_user_id,
        Test.test_name == test_in.test_name
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student {test_in.student_user_id} đã có test {test_in.test_name}"
        )

    db_test = Test(
        test_name=test_in.test_name,
        student_user_id=test_in.student_user_id,
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


def update_test(db: Session, test_id: int, test_update: TestUpdate, current_user: AuthenticatedUser):
    db_test = db.query(Test).filter(Test.test_id == test_id).first()
    if not db_test:
        return None

    # Nếu user là teacher -> chỉ update test của lớp mình dạy
    if "teacher" in current_user.roles:
        db_class = db.get(Class, db_test.class_id)
        if not db_class or db_class.teacher_user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền cập nhật bài kiểm tra này."
            )

    update_data = test_update.model_dump(exclude_unset=True)
    new_class_id = update_data.get("class_id", db_test.class_id)
    new_student_id = update_data.get("student_user_id", db_test.student_user_id)

    # Validate enrollment
    validate_student_enrollment(db, new_student_id, new_class_id)

    if "class_id" in update_data:
        new_class = db.get(Class, new_class_id)
        if not new_class:
            return None
        db_test.subject_id = new_class.subject_id
        db_test.teacher_user_id = new_class.teacher_user_id

    for key, value in update_data.items():
        setattr(db_test, key, value)

    db.commit()
    db.refresh(db_test)
    return db_test


def get_test(db: Session, test_id: int, current_user: AuthenticatedUser = None):
    stmt = select(Test).where(Test.test_id == test_id)
    test = db.execute(stmt).scalars().first()

    if not test:
        return None

    # Nếu user là teacher -> chỉ cho phép xem test của lớp mình dạy
    if current_user and "teacher" in current_user.roles:
        db_class = db.get(Class, test.class_id)
        if not db_class or db_class.teacher_user_id != current_user.user_id:
            return None

    if current_user and "student" in current_user.roles:
        db_student = db.get(Student, test.student_user_id)
        if not db_student or db_student.user_id != current_user.user_id:
            return None

    return test


def delete_test(db: Session, test_id: int, current_user: AuthenticatedUser):
    db_test = db.query(Test).filter(Test.test_id == test_id).first()
    if not db_test:
        return None

    # Nếu teacher thì chỉ xóa test của lớp mình
    if "teacher" in current_user.roles:
        db_class = db.get(Class, db_test.class_id)
        if not db_class or db_class.teacher_user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xóa bài kiểm tra này."
            )

    db.delete(db_test)
    db.commit()
    return db_test

def get_tests_by_student_user_id (db: Session, student_user_id : int, skip: int = 0, limit: int = 100):
    """Lấy danh sách các bài kiểm tra theo student_user_id ."""
    stmt = select(Test).where(Test.student_user_id  == student_user_id ).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_tests_by_teacher_user_id (db: Session, teacher_user_id : int, skip: int = 0, limit: int = 100):
    """Lấy danh sách các bài kiểm tra theo teacher_user_id ."""
    stmt = select(Test).where(Test.teacher_user_id  == teacher_user_id ).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_tests_by_subject_id(db: Session, subject_id: int, skip: int = 0, limit: int = 100):
    stmt = select(Test).where(Test.subject_id  == subject_id ).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def get_all_tests(db: Session, current_user: AuthenticatedUser, skip: int = 0, limit: int = 100):
    """
    - Manager: Trả về tất cả.
    - Teacher: Chỉ trả về test của các lớp mình dạy.
    - Student: Chỉ trả về test của chính mình.
    - Parent: Chỉ trả về test của con mình.
    """
    stmt = select(Test)
    filters = []

    # --- BƯỚC 1: Xử lý Manager (Ưu tiên Cao nhất) ---
    # Nếu người dùng là Manager, trả về TẤT CẢ ngay lập tức.
    if "manager" in current_user.roles:
        # Bỏ qua tất cả các bộ lọc khác.
        stmt = stmt.offset(skip).limit(limit)
        return db.execute(stmt).scalars().all()

    # --- BƯỚC 2: Xử lý các vai trò khác (sử dụng OR để kết hợp) ---

    # 1. Vai trò Teacher
    if "teacher" in current_user.roles:
        # Lọc theo teacher_user_id của test
        filters.append(Test.teacher_user_id == current_user.user_id)

    # 2. Vai trò Student
    if "student" in current_user.roles:
        # Lọc theo student_user_id của test
        filters.append(Test.student_user_id == current_user.user_id)

    # 3. Vai trò Parent
    if "parent" in current_user.roles:
        # Tìm tất cả student_user_id là con của parent này
        # (Giả định Student model đã được import)
        child_students = db.execute(
            select(Student.user_id).where(Student.parent_id == current_user.user_id)
        ).scalars().all()
        
        if child_students:
            # Lọc test theo danh sách ID học sinh là con
            filters.append(Test.student_user_id.in_(child_students))
        else:
            # Nếu không có con, tạo điều kiện không bao giờ đúng để không trả về test nào
            filters.append(Test.test_id == -1) 

    # --- BƯỚC 3: Áp dụng bộ lọc (Chỉ khi filters KHÔNG rỗng) ---
    if filters:
        # Kết hợp các điều kiện lọc bằng OR
        # Đây là lý do tại sao Manager phải được xử lý riêng ở trên.
        stmt = stmt.where(or_(*filters))
    
    # Áp dụng phân trang
    stmt = stmt.offset(skip).limit(limit)
    

