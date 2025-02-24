FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

ENV PY_RABBITMQ_HOST=${PY_RABBITMQ_HOST} \
    PY_RABBITMQ_USER=${PY_RABBITMQ_USER} \
    PY_RABBITMQ_PASSWORD=${PY_RABBITMQ_PASSWORD}

CMD ["python3", "main.py"]
