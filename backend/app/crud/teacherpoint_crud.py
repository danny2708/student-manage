from sqlalchemy.orm import Session
from app.models.teacherpoint_model import TeacherPoint
from app.schemas.teacherpoint_schema import TeacherPointCreate, TeacherPointUpdate

def get_teacher_point(db: Session, point_id: int):
    """Lấy thông tin điểm thưởng/phạt giáo viên theo ID."""
    return db.query(TeacherPoint).filter(TeacherPoint.point_id == point_id).first()

def get_teacher_points_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách điểm thưởng/phạt theo teacher_id."""
    return db.query(TeacherPoint).filter(TeacherPoint.teacher_id == teacher_id).offset(skip).limit(limit).all()

def get_all_teacher_points(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả điểm thưởng/phạt giáo viên."""
    return db.query(TeacherPoint).offset(skip).limit(limit).all()

def create_teacher_point(db: Session, teacher_point: TeacherPointCreate):
    """Tạo mới một bản ghi điểm thưởng/phạt giáo viên."""
    db_teacher_point = TeacherPoint(**teacher_point.model_dump())
    db.add(db_teacher_point)
    db.commit()
    db.refresh(db_teacher_point)
    return db_teacher_point

def update_teacher_point(db: Session, point_id: int, teacher_point_update: TeacherPointUpdate):
    """Cập nhật thông tin điểm thưởng/phạt giáo viên."""
    db_teacher_point = db.query(TeacherPoint).filter(TeacherPoint.point_id == point_id).first()
    if db_teacher_point:
        update_data = teacher_point_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_teacher_point, key, value)
        db.add(db_teacher_point)
        db.commit()
        db.refresh(db_teacher_point)
    return db_teacher_point

def delete_teacher_point(db: Session, point_id: int):
    """Xóa một bản ghi điểm thưởng/phạt giáo viên."""
    db_teacher_point = db.query(TeacherPoint).filter(TeacherPoint.point_id == point_id).first()
    if db_teacher_point:
        db.delete(db_teacher_point)
        db.commit()
    return db_teacher_point

