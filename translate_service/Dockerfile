# Usar uma imagem base otimizada para Python
FROM python:3.11-slim

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar apenas os arquivos essenciais primeiro (para otimizar o cache)
COPY requirements.txt .

# Instalar as dependências necessárias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código da aplicação para o container
COPY . .

# Definir variáveis de ambiente (pode ser sobrescrito no `docker run` ou `docker-compose`)
ENV PY_RABBITMQ_HOST=rabbitmq_container_dev \
    PY_RABBITMQ_USER=root \
    PY_RABBITMQ_PASSWORD=randompassword

# Comando para rodar a aplicação
CMD ["python", "main.py"]
