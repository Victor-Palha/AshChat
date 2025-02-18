#!/bin/bash

# Check if the .env file exists and export each variable
if [ -f .env ]; then
    # Loop through each line in the .env file
    while IFS= read -r line || [[ -n "$line" ]]; do
        echo "Processing line: $line"
        # Ignore empty lines and comments
        if [[ -n "$line" && "$line" != \#* ]]; then
            # Remove leading and trailing spaces and then export the variable
            line=$(echo "$line" | xargs)
            export "$line"
        fi
    done < .env
    echo ".env file loaded successfully!"
else
    echo ".env file not found!"
fi
