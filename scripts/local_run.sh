#!/bin/bash

# Caminhos para os serviços
AUTH_SERVICE="$PWD/../auth_service"
EMAIL_SERVICE="$PWD/../email_service"
TRANSLATE_SERVICE="$PWD/../translate_service"
CHAT_SERVICE="$PWD/../chat_service"

# Função para abrir um novo terminal e executar um comando
start_service() {
    local service_name="$1"
    local service_path="$2"
    local command="$3"

    echo "Starting $service_name..."
    osascript -e "tell application \"Terminal\" to do script \"cd '$service_path' && $command\""
}

# Inicia Auth Service
start_service "Auth Service" "$AUTH_SERVICE" "npm install && npm run start:dev"

# Espera 2 segundos para evitar conflitos
sleep 2

# Inicia Email Service
start_service "Email Service" "$EMAIL_SERVICE" "npm install && npm run start:dev"

# Espera 2 segundos para evitar conflitos
sleep 2

# Inicia Translate Service
start_service "Translate Service" "$TRANSLATE_SERVICE" "source venv/bin/activate && pip install -r requirements.txt && python3 ./main.py"

# Espera 2 segundos para evitar conflitos
sleep 2

# Inicia Chat Service
start_service "Chat Service" "$CHAT_SERVICE" "chmod +x ./start.sh && source ./start.sh"

# Mensagem final de sucesso
echo "All services are running in separate Terminal windows."
