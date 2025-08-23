@echo off
REM Chuyển đến thư mục dự án
cd /d D:\student-management\backend REM tùy vào đường dẫn trên máy

REM Kích hoạt môi trường ảo
call venv\Scripts\activate

REM Chạy máy chủ uvicorn
uvicorn main:app --reload

REM Giữ cửa sổ mở sau khi hoàn thành (tùy chọn)
pause
