from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.student_model import Student
from app.models.association_tables import student_parent_association
from app.models.parent_model import Parent


def get_user_id_from_student_id(db: Session, student_id: int) -> int | None:
    """
    Lấy user_id gắn với student_id.
    """
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if student:
        return student.user_id
    return None


def is_parent_of_student(db: Session, parent_user_id: int, student_user_id: int) -> bool:
    """
    Kiểm tra xem parent_user_id có phải là phụ huynh của student_user_id không.
    """
    stmt = (
        select(student_parent_association.c.student_id)
        .join(Parent, Parent.parent_id == student_parent_association.c.parent_id)
        .join(Student, Student.student_id == student_parent_association.c.student_id)
        .where(Parent.user_id == parent_user_id, Student.user_id == student_user_id)
    )

    result = db.execute(stmt).first()
    return result is not None
