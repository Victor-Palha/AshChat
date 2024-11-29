import pika
import os
from dotenv import load_dotenv, dotenv_values 
load_dotenv()

py_rabbitmq_host = os.getenv("PY_RABBITMQ_HOST")
py_rabbitmq_username = os.getenv("PY_RABBITMQ_USER")
py_rabbitmq_password = os.getenv("PY_RABBITMQ_PASSWORD")

print(py_rabbitmq_host)
print(py_rabbitmq_username)
print(py_rabbitmq_password)

class RabbitMQConnection:
    def __init__(self, username=py_rabbitmq_username, password=py_rabbitmq_password, host=py_rabbitmq_host, port=5672):
        self.credentials = pika.PlainCredentials(username, password)
        self.host = host
        self.port = port

    def create_channel(self):
        parameters = pika.ConnectionParameters(
            host=self.host,
            port=self.port,
            credentials=self.credentials
        )
        connection = pika.BlockingConnection(parameters)
        return connection.channel()