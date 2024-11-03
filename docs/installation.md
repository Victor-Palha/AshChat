# AshChat Installation Guide

Follow these steps to install the AshChat project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (version 10 or higher)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Installation Steps

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

3. **Install Dependencies - Backend**
Install the required dependencies of the backend using npm:
```bash
    cd ./AshChat/backend
    npm install
```

4. **Install Dependencies - Email Service**
Install the required dependencies using npm:
```bash
    cd ./AshChat/email-verification-service
    npm install
```

5. **Configure Environment Variables**
Create a `.env` file in the root directory and add the necessary environment variables. Refer to `.env.example` for the required variables for both the backend and email service.

5. **Run Docker to Up the Dependencies Container**
On the root directory __(AshChat)__, run the following command to up the dependencies container:
```bash
    chmod +x start.sh
    chmod +x start-service.sh

    ./start.sh
    ./start-service.sh
```

6. **Access the API**
You can access the API at `http://localhost:3005`.

## Troubleshooting

If you encounter any issues during installation, refer to the [FAQ](FAQ.md) or open an issue on the [GitHub repository](https://github.com/Victor-Palha/AshChat/issues).
