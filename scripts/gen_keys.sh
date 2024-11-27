#!/bin/bash

# Define the directory and file paths
PRIVATE_KEY_DIR="../backend/"
PUBLIC_KEY_DIR="../chat_service/priv/keys"

PRIVATE_KEY_FILE="$PRIVATE_KEY_DIR/private_key.pem"
PUBLIC_KEY_FILE="$PUBLIC_KEY_DIR/public_key.pem"

# Create the directory if it doesn't exist
mkdir -p "$KEY_DIR"

# Generate a private key
if [ ! -f "$PRIVATE_KEY_FILE" ]; then
    echo "Generating private key..."
    openssl genpkey -algorithm RSA -out "$PRIVATE_KEY_FILE" -pkeyopt rsa_keygen_bits:2048
    echo "Private key saved to $PRIVATE_KEY_FILE"
else
    echo "Private key already exists at $PRIVATE_KEY_FILE"
fi

# Extract the public key from the private key
if [ ! -f "$PUBLIC_KEY_FILE" ]; then
    echo "Generating public key..."
    openssl rsa -pubout -in "$PRIVATE_KEY_FILE" -out "$PUBLIC_KEY_FILE"
    echo "Public key saved to $PUBLIC_KEY_FILE"
else
    echo "Public key already exists at $PUBLIC_KEY_FILE"
fi
