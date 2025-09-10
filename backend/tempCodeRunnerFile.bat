@echo off
REM Chuyển đến thư mục dự án backend
cd /d backend

REM Kích hoạt môi trường ảo
call venv\Scripts\activate

REM Chạy máy chủ uvicorn (chạy song song với frontend)
uvicorn main:app --reload

REM Chuyển sang thư mục frontend
REM cd /d ../frontend

REM Chạy frontend
REM npm run dev
