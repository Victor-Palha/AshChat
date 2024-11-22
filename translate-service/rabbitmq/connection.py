import pika


class RabbitMQConnection:
    def __init__(self, username="root", password="randompassword", host="localhost", port=5672):
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
