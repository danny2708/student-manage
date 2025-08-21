# app/services/payroll_service.py
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.crud.payroll_crud import get_all_teachers, create_payroll_record
from app.models.teacher_model import Teacher
from app.models.class_model import Class
from app.schemas.payroll_schema import PayrollCreate

def run_monthly_payroll(db: Session):
    """
    Chạy quá trình tính và lưu bảng lương cho tất cả giáo viên.
    Hàm này được gọi bởi một tác vụ định kỳ (scheduled task) vào ngày 29 hàng tháng.
    """
    today = datetime.now()
    month = today.month
    year = today.year

    # Lấy danh sách tất cả giáo viên
    teachers = get_all_teachers(db)
    
    for teacher in teachers:
        # Truy vấn để đếm số lớp mà giáo viên đang dạy
        # Đếm số lượng bản ghi trong bảng Class có teacher_id tương ứng
        class_count_stmt = select(func.count(Class.class_id)).where(Class.teacher_id == teacher.teacher_id)
        num_classes_taught = db.execute(class_count_stmt).scalar_one()
        
        # Lấy lương cơ bản và tiền thưởng từ model Teacher
        # Lưu ý: Các trường này cần phải tồn tại trong model Teacher của bạn.
        base_salary_per_class = getattr(teacher, 'base_salary_per_class', 0)
        reward_bonus = getattr(teacher, 'reward_bonus', 0)

        # Tính tổng lương từ số lớp dạy
        base_salary = num_classes_taught * base_salary_per_class

        # Tính lương tổng cuối cùng bao gồm cả tiền thưởng
        total_salary = base_salary + reward_bonus

        # Tạo bản ghi lương
        # Thay đổi từ `user_id` thành `teacher_id` để khớp với schema PayrollCreate.
        payroll_in = PayrollCreate(
            teacher_id=teacher.teacher_id,
            month=month,
            base_salary=base_salary, # Tổng lương từ các lớp đã dạy
            reward_bonus=reward_bonus,
            total=total_salary,
            sent_date=today.date()
        )
        create_payroll_record(db, payroll_in)

    print(f"Quá trình tính lương cho tháng {month}/{year} đã hoàn tất.")
