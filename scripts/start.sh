#!/bin/bash

if ! command -v docker &> /dev/null; then
    echo "Docker isn't installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose isn't installed. Please install Docker Compose first."
    exit 1
fi

DOCKER_COMPOSE_DIR="../docker"

# Navega até o diretório do docker-compose
cd "$DOCKER_COMPOSE_DIR" || { echo "Directory not found: $DOCKER_COMPOSE_DIR"; exit 1; }

# Inicializa os contêineres
echo "Initializing conteiners..."
docker compose up -d

# Verifica se os contêineres foram iniciados com sucesso
if [ $? -eq 0 ]; then
    echo "Conteiners initialized successfully."
else
    echo "Failed to initialize conteiners."
    exit 1
fi

# Exibe o status dos contêineres
docker compose ps
