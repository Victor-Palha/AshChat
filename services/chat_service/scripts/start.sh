#!/bin/bash

# Load environment variables from .env file
source load_env.sh

# Start the Phoenix server
cd .. && iex -S mix phx.server