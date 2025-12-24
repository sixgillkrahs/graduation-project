sử dụng python3.9 để chạy project
py -3.9 -m venv venv
venv\Scripts\activate

.\venv\Scripts\python.exe .\venv\Scripts\python.exe -m pip install torch==2.0.1 torchvision==0.15.2 --only-binary=:all:
.\venv\Scripts\python.exe -m pip install patch-ng
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe run.py
