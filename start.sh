#!/bin/bash

# Verifica se o Docker e o Docker Compose estão instalados
if ! command -v docker &> /dev/null; then
    echo "Docker isn't installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose isn't installed. Please install Docker Compose first."
    exit 1
fi

DOCKER_COMPOSE_MQ_DIR="./"
DOCKER_COMPOSE_REDIS_DIR="./email-verification-service"
DOCKER_COMPOSE_MONGO_DIR="./backend"

# Navega até o diretório do docker-compose
cd "$DOCKER_COMPOSE_MQ_DIR" || { echo "Directory not found: $DOCKER_COMPOSE_MQ_DIR"; exit 1; }

# Inicializa os contêineres
echo "Initializing RabbitMQ container..."
docker compose up -d

cd "$DOCKER_COMPOSE_REDIS_DIR" || { echo "Directory not found: $DOCKER_COMPOSE_REDIS_DIR"; exit 1; }
docker compose up -d

cd "../$DOCKER_COMPOSE_MONGO_DIR" || { echo "Directory not found: $DOCKER_COMPOSE_MONGO_DIR"; exit 1; }
docker compose up -d

# Verifica se os contêineres foram iniciados com sucesso
if [ $? -eq 0 ]; then
    echo "Conteiners initialized successfully."
else
    echo "Failed to initialize conteiners."
    exit 1
fi

# Exibe o status dos contêineres
docker-compose ps
