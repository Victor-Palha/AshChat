#!/bin/bash

# Define the path to the .env file
ENV_FILE="../.env"

# Check if the .env file exists and export each variable
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE..."
    
    # Loop through each line in the .env file
    while IFS= read -r line || [[ -n "$line" ]]; do
        echo "Processing line: $line"
        
        # Ignore empty lines and comments
        if [[ -n "$line" && "$line" != \#* ]]; then
            # Remove leading and trailing spaces and then export the variable
            line=$(echo "$line" | xargs)
            export "$line"
        fi
    done < "$ENV_FILE"
    
    echo "Environment variables loaded successfully from $ENV_FILE!"
else
    echo "Error: $ENV_FILE not found!"
    exit 1
fi