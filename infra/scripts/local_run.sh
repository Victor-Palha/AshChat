#!/bin/bash

# Caminhos para os serviços
AUTH_SERVICE="$PWD/../../services/auth_service_spring"
EMAIL_SERVICE="$PWD/../../services/email_service"
TRANSLATE_SERVICE="$PWD/../../services/translate_service"
CHAT_SERVICE="$PWD/../../services/chat_service"
STATIC_SERVICE="$PWD/../../services/static_service"

# Função para abrir um novo terminal e executar um comando
start_service() {
    local service_name="$1"
    local service_path="$2"
    local command="$3"

    echo "Starting $service_name..."
    osascript -e "tell application \"Terminal\" to do script \"cd '$service_path' && $command\""
}
# Criar chave JWT
echo "Creating JWT key..."
chmod +x gen_key.sh
source gen_key.sh

# Inicia Auth Service
start_service "Auth Service" "$AUTH_SERVICE" "./mvnw clean install && ./mvnw spring-boot:run"

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

# Espera 2 segundos para evitar conflitos
sleep 2

# Inicia Static Service
start_service "Static Service" "$STATIC_SERVICE" "bun install && bun run src/index.ts"

# Mensagem final de sucesso
echo "All services are running in separate Terminal windows."
