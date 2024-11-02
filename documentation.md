# Project Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Setup and Installation](#setup-and-installation)
4. [Running the Project](#running-the-project)
5. [Configuration](#configuration)
6. [Services](#services)
7. [Environment Variables](#environment-variables)
8. [Docker](#docker)
9. [Scripts](#scripts)

## Introduction
This project consists of a backend service and an email verification service. The backend service handles the main application logic, while the email verification service manages email verification processes.

## Project Structure
```
backend/
	.env
	.gitignore
	@types/
		express/
			index.d.ts
	development.env
	docker-compose.yaml
	package.json
	src/
		api/
			controllers/
			middlewares/
			routes.ts
		app.ts
		config/
			env.ts
			mongo.ts
			rabbitmq/
		domain/
			...
		persistence/
		server.ts
		websocket/
	tsconfig.json
docker-compose.yaml
email-verification-service/
	.env
	.gitignore
	development.env
	docker-compose.yaml
	package.json
	src/
		config/
		errors/
		index.ts
		services/
	tsconfig.json
README.md
start.sh
```

## Setup and Installation
1. **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies for both services:**
    ```sh
    cd backend
    npm install
    cd ../email-verification-service
    npm install
    ```

## Running the Project
To run the project, you can use the provided 

start.sh

 script which initializes the necessary Docker containers.

1. **Make the script executable:**
    ```sh
    chmod +x start.sh
    ```

2. **Run the script:**
    ```sh
    ./start.sh
    ```

## Configuration
Configuration files are located in the `config` directories of both services. These files manage environment variables, database connections, and other service-specific settings.

### Backend Configuration
- env.ts


- mongo.ts


- rabbitmq



### Email Verification Service Configuration
- config



## Services
### Backend
The backend service handles the main application logic, including API endpoints, middleware, and database interactions.

### Email Verification Service
The email verification service manages email verification processes and related functionalities.

## Environment Variables
Environment variables are defined in `.env` files located in the root directories of both services.

### Backend
- .env

- development.env



### Email Verification Service
- .env


- development.env



## Docker
Docker is used to containerize the services and manage dependencies.

### Docker Compose
Docker Compose files are located in the root directories of both services and are used to define and run multi-container Docker applications.

- docker-compose.yaml

## Scripts
### 

start.sh


The 

start.sh

 script checks for Docker and Docker Compose installations, navigates to the appropriate directories, and initializes the necessary Docker containers.

- start.sh



```sh
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
```