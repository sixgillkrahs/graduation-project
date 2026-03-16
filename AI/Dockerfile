FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt

RUN pip install --upgrade pip wheel && \
    pip install -r requirements.txt

COPY run.py ./run.py
COPY prepare_ocr_assets.py ./prepare_ocr_assets.py
COPY sources ./sources

RUN mkdir -p sources/static/results && \
    python prepare_ocr_assets.py

EXPOSE 8080
CMD ["python", "run.py"]
