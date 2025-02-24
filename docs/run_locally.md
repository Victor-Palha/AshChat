# Local and Manual Installation

### 1. Clone the Repository
Clone the repository using the following command:
```bash
git clone https://github.com/Victor-Palha/AshChat.git
```

### 2. Navigate to the Project Directory
Move into the project folder:
```bash
cd AshChat
```

### 3. Install Dependencies
Install dependencies for each service:

- **Auth Service**:
  ```bash
  cd ./services/auth_service_spring
  ./mvnw clean install
  ```

- **Email Service**:
  ```bash
  cd ./services/email_service
  npm install
  ```

- **Translate Service**:
  ```bash
  cd ./services/translate_service
  source venv/bin/activate
  pip3 install -r requirements.txt
  ```

- **Chat Service**:
  ```bash
  cd ./services/chat_service
  mix deps.get
  ```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and add the necessary environment variables. Refer to `.env.example` for the required variables for the **email service**, **chat service**, and **translate service**.

### 5. Generate JWT Key Files
Run the following command to generate JWT key files:
```bash
cd ./infra/scripts
chmod +x gen_keys.sh
source gen_keys.sh
```
This will create `private_key.pem` and `public_key.pem` in:
- `AshChat/services/auth_service_spring/src/main/resources`
- `AshChat/services/chat_service/priv/keys`

### 6. Start Docker Dependencies
Run the required dependencies using Docker:
```bash
cd ./infra/dependencies
docker compose up
```
This will start:
- **Redis**
- **RabbitMQ**
- **MongoDB**
- **Kong**

> **Note**: This Docker setup is for running dependencies manually.

### 7. Configure API Gateway (Kong)
To use the API Gateway, access the [Kong GUI](http://localhost:8002/) and manually configure the services and routing.

### 8. Run the Services
Start each service in a separate terminal:

- **Auth Service**:
  ```bash
  cd AshChat/services/auth_service_spring
  ./mvnw spring-boot:run
  ```

- **Email Service**:
  ```bash
  cd AshChat/services/email_service
  npm run start:dev
  ```

- **Translate Service**:
  ```bash
  cd AshChat/services/translate_service
  source venv/bin/activate
  python3 main.py
  ```

- **Chat Service**:
  ```bash
  cd AshChat/services/chat_service
  chmod +x start.sh
  source start.sh
  ```

---

## Automated Installation
For a quicker setup, use the automated installation script. Note that this script is designed for **MacOS** and may not work on other operating systems.

1. Start Docker services:
   ```bash
   cd AshChat/infra/dependencies
   docker compose up
   ```

2. Run the services locally:
   ```bash
   cd AshChat/infra/scripts
   chmod +x local_run.sh
   source local_run.sh
   ```

---