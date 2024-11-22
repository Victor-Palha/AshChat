import json
from rabbitmq.connection import RabbitMQConnection
from utils.queues import QUEUE_INPUT, QUEUE_OUTPUT


class RabbitMQConsumer:
    def __init__(self, translator):
        self.translator = translator
        self.connection = RabbitMQConnection()
        self.channel = self.connection.create_channel()

        # Declara as fila
        self.channel.queue_declare(queue=QUEUE_INPUT, durable=True, auto_delete=False)
        self.channel.queue_declare(queue=QUEUE_OUTPUT, durable=True, auto_delete=False)

    def _callback(self, ch, method, properties, body):
        message = json.loads(body)
        print("Mensagem recebida:", message)

        # Realiza a tradução
        translated_text = self.translator.translate(
            message["text"],
            message["source_language"],
            message["target_language"],
        )

        print("Tradução:", translated_text)

        response = {
            "original_text": message["text"],
            "translated_text": translated_text,
            "source_language": message["source_language"],
            "target_language": message["target_language"],
        }

        ch.basic_publish(exchange="", routing_key=QUEUE_OUTPUT, body=json.dumps(response))
        ch.basic_ack(delivery_tag=method.delivery_tag)

    def start(self):
        print("Aguardando mensagens...")
        self.channel.basic_consume(queue=QUEUE_INPUT, on_message_callback=self._callback)
        self.channel.start_consuming()
