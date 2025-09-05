@echo off
REM Chuyển đến thư mục dự án
cd /d backend

REM Kích hoạt môi trường ảo
call venv\Scripts\activate

REM Chạy máy chủ uvicorn
uvicorn main:app --reload

