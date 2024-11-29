import json
from rabbitmq.connection import RabbitMQConnection

class RabbitMQPublisher:
    def __init__(self):
        self.connection = RabbitMQConnection()
        self.channel = self.connection.create_channel()

    def publish(self, queue, message):
        self.channel.basic_publish(exchange="", routing_key=queue, body=json.dumps(message))
        print(f"Mensagem publicada na fila '{queue}': {message}")
