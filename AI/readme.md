sử dụng python3.9 để chạy project
py -3.9 -m venv venv
venv\Scripts\activate

.\venv\Scripts\python.exe -m pip install torch==2.0.1 torchvision==0.15.2 --only-binary=:all:
.\venv\Scripts\python.exe -m pip install patch-ng
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe run.py

separate services:

- OCR service: `.\venv\Scripts\python.exe run.py`
- Moderation service: `.\venv\Scripts\python.exe run_moderation.py`

docker moderation service:

```bash
docker build -f Dockerfile.moderation -t ai-moderation-service .
docker run --rm -p 8081:8081 ai-moderation-service
```

docker OCR service:

```bash
docker build -t ai-ocr-service .
docker run --rm -p 8080:8080 ai-ocr-service
```

OCR image now includes local YOLO + VietOCR weights and generates a local
`sources/Database/OCR/config/seq2seq_config.yml` during build, so runtime does
not need to download OCR config/model files.

text moderation (vi + en) baseline:

.\venv\Scripts\python.exe scripts\train_text_moderation.py

api:
- GET `/moderation/status`
- POST `/moderation/predict`
- POST `/moderation/predict-batch`

example body:
{
  "text": "dm may"
}

use Hugging Face model exported from Colab:

1. Copy `hf_moderation_model.zip` into `AI\models\hf_moderation_model.zip`
2. Install/update dependencies:
   `.\venv\Scripts\python.exe -m pip install -r requirements.txt`
3. Run the moderation API:
   `.\venv\Scripts\python.exe run_moderation.py`
4. OCR stays separate:
   `.\venv\Scripts\python.exe run.py`
5. Check backend:
   `GET /moderation/status`

Ports:

- OCR: `http://127.0.0.1:8080`
- Moderation: `http://127.0.0.1:8081`

If the zip exists, the moderation service will auto-extract and prioritize the Hugging Face model.
