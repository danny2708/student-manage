from typing import List, Optional

from sqlalchemy.orm import Session
from app.models.association_tables import StudentClassAssociation
from app.schemas.student_class_association_schema import StudentClassAssociationCreate, StudentClassAssociationUpdate

def get_student_class(db: Session, studentclass_id: int) -> Optional[StudentClassAssociation]:
    """Lấy thông tin liên kết học sinh-lớp học theo ID.

    Args:
        db (Session): Phiên làm việc của database.
        studentclass_id (int): ID của bản ghi liên kết.

    Returns:
        Optional[StudentClassAssociation]: Đối tượng StudentClassAssociation nếu tìm thấy, ngược lại là None.
    """
    return db.query(StudentClassAssociation).filter(StudentClassAssociation.studentclass_id == studentclass_id).first()

def get_student_classes_by_student_id(
    db: Session, student_id: int, skip: int = 0, limit: int = 100
) -> List[StudentClassAssociation]:
    """Lấy danh sách liên kết học sinh-lớp học theo student_id.

    Args:
        db (Session): Phiên làm việc của database.
        student_id (int): ID của học sinh.
        skip (int): Bỏ qua số bản ghi.
        limit (int): Giới hạn số bản ghi.

    Returns:
        List[StudentClassAssociation]: Danh sách các đối tượng StudentClassAssociation.
    """
    return db.query(StudentClassAssociation).filter(StudentClassAssociation.student_id == student_id).offset(skip).limit(limit).all()

def get_student_classes_by_class_id(
    db: Session, class_id: int, skip: int = 0, limit: int = 100
) -> List[StudentClassAssociation]:
    """Lấy danh sách liên kết học sinh-lớp học theo class_id.

    Args:
        db (Session): Phiên làm việc của database.
        class_id (int): ID của lớp học.
        skip (int): Bỏ qua số bản ghi.
        limit (int): Giới hạn số bản ghi.

    Returns:
        List[StudentClassAssociation]: Danh sách các đối tượng StudentClassAssociation.
    """
    return db.query(StudentClassAssociation).filter(StudentClassAssociation.class_id == class_id).offset(skip).limit(limit).all()

def get_all_student_classes(db: Session, skip: int = 0, limit: int = 100) -> List[StudentClassAssociation]:
    """Lấy danh sách tất cả liên kết học sinh-lớp học.

    Args:
        db (Session): Phiên làm việc của database.
        skip (int): Bỏ qua số bản ghi.
        limit (int): Giới hạn số bản ghi.

    Returns:
        List[StudentClassAssociation]: Danh sách tất cả các đối tượng StudentClassAssociation.
    """
    return db.query(StudentClassAssociation).offset(skip).limit(limit).all()

def create_student_class(db: Session, student_class_in: StudentClassAssociationCreate) -> StudentClassAssociation:
    """Tạo mới một liên kết học sinh-lớp học.

    Args:
        db (Session): Phiên làm việc của database.
        student_class_in (StudentClassAssociationCreate): Schema Pydantic chứa dữ liệu tạo mới.

    Returns:
        StudentClassAssociation: Đối tượng StudentClassAssociation vừa được tạo.
    """
    db_student_class = StudentClassAssociation(**student_class_in.model_dump())
    db.add(db_student_class)
    db.commit()
    db.refresh(db_student_class)
    return db_student_class

def update_student_class(
    db: Session, studentclass_id: int, student_class_update: StudentClassAssociationCreate
) -> Optional[StudentClassAssociation]:
    """Cập nhật thông tin liên kết học sinh-lớp học.

    Args:
        db (Session): Phiên làm việc của database.
        studentclass_id (int): ID của bản ghi liên kết cần cập nhật.
        student_class_update (StudentClassAssociationCreate): Schema Pydantic chứa dữ liệu cập nhật.

    Returns:
        Optional[StudentClassAssociation]: Đối tượng StudentClassAssociation đã được cập nhật hoặc None nếu không tìm thấy.
    """
    db_student_class = db.query(StudentClassAssociation).filter(StudentClassAssociation.studentclass_id == studentclass_id).first()
    if db_student_class:
        update_data = student_class_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student_class, key, value)
        
        db.add(db_student_class)
        db.commit()
        db.refresh(db_student_class)
    return db_student_class

def delete_student_class(db: Session, studentclass_id: int) -> Optional[StudentClassAssociation]:
    """Xóa một liên kết học sinh-lớp học.

    Args:
        db (Session): Phiên làm việc của database.
        studentclass_id (int): ID của bản ghi liên kết cần xóa.

    Returns:
        Optional[StudentClassAssociation]: Đối tượng StudentClassAssociation đã bị xóa hoặc None nếu không tìm thấy.
    """
    db_student_class = db.query(StudentClassAssociation).filter(StudentClassAssociation.studentclass_id == studentclass_id).first()
    if db_student_class:
        db.delete(db_student_class)
        db.commit()
    return db_student_class
