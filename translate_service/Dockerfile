FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

ENV PY_RABBITMQ_HOST=rabbitmq_container_dev \
    PY_RABBITMQ_USER=root \
    PY_RABBITMQ_PASSWORD=randompassword

CMD ["python3", "main.py"]
