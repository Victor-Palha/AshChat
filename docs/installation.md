# AshChat Installation Guide

Follow these steps to install the AshChat project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (version 10 or higher)
- [Git](https://git-scm.com/)
- [Python](https://www.python.org/)
- [Elixir](https://elixir-lang.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Installation Steps Locally and Manually

1. **Clone the Repository**
Open your terminal and run the following command to clone the repository:

```bash
    git clone https://github.com/Victor-Palha/AshChat.git
```

2. **Navigate to the Project Directory**
Change to the project directory:
```bash
    cd AshChat
```

3. **Install Dependencies - Auth Service**
Install the required dependencies of the backend using npm:
```bash
    cd ./AshChat/auth_service
    npm install
```

4. **Install Dependencies - Email Service**
Install the required dependencies using npm:
```bash
    cd ./AshChat/email_service
    npm install
```

5. **Install Dependencies - Translate Service**
Install the required dependencies using pip:
```bash
    cd ./AshChat/translate_service
    source venv/bin/activate
    pip install -r requirements.txt
```

6. **Install Dependencies - Chat Service**
Install the required dependencies using npm:
```bash
    cd ./AshChat/chat_service
    mix deps.get
```

7. **Configure Environment Variables**
Create a `.env` file in the root directory and add the necessary environment variables. Refer to `.env.example` for the required variables for the _auth service_, _email service_ and _chat service_.

8. **Create key files for the JWT**
On the root directory, run the following command to create the key files for the JWT:
```bash
    cd scripts
    chmod +x gen_keys.sh
    source gen_keys.sh
```
This will create the `private_key.pem` and `public_ket.pem` files in __AshChat/auth_service/priv/keys__ and __AshChat/auth_service__.

9. **Run Docker for Dependencies**
The dependencies for the project are run using Docker and they are defined in the __AshChat/docker/docker-compose.yml__ file. To run the dependencies, run the following command:
```bash
    cd scripts
    chmod +x start.sh
    source start.sh
```
This will start:
- **Redis**
- **RabbitMQ**
- **MongoDB**


11. **Run the Services**
To run the services, open a new terminal and run the following commands:
- **Auth Service**
```bash
    cd AshChat/auth_service
    npm run start:dev
```
- **Email Service**
```bash
    cd AshChat/email_service
    npm run start:dev
```
- **Translate Service**
```bash
    cd AshChat/translate_service
    source venv/bin/activate
    python3 main.py
```
- **Chat Service**
```bash
    cd AshChat/chat_service
    chmod +x start.sh
    source start.sh
```

## Automated Installation
If you don't want to install the project manually, you can use the automated installation script. The script will install the project and run the services for you. But be aware that the script was written for a MacOS environment and may not work on other operating systems.
```bash
    cd scripts
    chmod +x local_run.sh
    source local_run.sh
```
Up docker-compose services:
```bash
    cd scripts
    chmod +x start.sh
    source start.sh
```

## Docker Installation
If you want to run the project using Docker, you can use the Dockerfile and docker-compose.yml files provided in the project. To run the project using Docker, follow these steps:

1. Create the `.env` file in the root directory and add the necessary environment variables. Refer to `.env.example` for the required variables for the _auth service_, _email service_ and _chat service_.

2. Create the key files for the JWT:
```bash
    cd scripts
    chmod +x gen_keys.sh
    source gen_keys.sh
```

3. Start the dependencies using Docker:
```bash
    cd scripts
    chmod +x start.sh
    source start.sh
```

4. Create a `.env` file in the root directory of the project and add these environment variables:
- **SMTP_EMAIL**
- **SMTP_PASSWORD**
These variables are used to send emails using the email service, if you don't provide them, the email service will not work!
If you do not have an SMTP email, you can create a new one following this [Article](https://dev.to/documatic/send-email-in-nodejs-with-nodemailer-using-gmail-account-2gd1)!

5. Run the project using Docker:
```bash
    cd AshChat
    docker-compose up --build
```

## Troubleshooting

If you encounter any issues during installation, refer to the [FAQ](FAQ.md) or open an issue on the [GitHub repository](https://github.com/Victor-Palha/AshChat/issues).
