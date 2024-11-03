#!/bin/bash

BACKEND_SERVICE="$PWD/backend"
EMAIL_SERVICE="$PWD/email-verification-service"

# Inicia o Backend em uma nova janela do Terminal
echo "Starting Backend..."
osascript -e "tell application \"Terminal\" to do script \"cd '$BACKEND_SERVICE' && npm install && npm run start:dev\""

# Espera um momento para garantir que o backend começou
sleep 2

# Inicia o Email Service em uma nova janela do Terminal
echo "Starting Email Service..."
osascript -e "tell application \"Terminal\" to do script \"cd '$EMAIL_SERVICE' && npm install && npm run start:dev\""

# Mensagem final de sucesso
echo "All services are running in separate Terminal windows."
