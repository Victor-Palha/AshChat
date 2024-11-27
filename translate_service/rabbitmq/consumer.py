import pika
import json
from rabbitmq.connection import RabbitMQConnection
from utils.queues import QUEUE_INPUT

class RabbitMQRPCServer:
    def __init__(self, translator):
        self.translator = translator
        self.connection = RabbitMQConnection()
        self.channel = self.connection.create_channel()

        # Declara a fila de entrada
        self.channel.queue_declare(queue=QUEUE_INPUT, durable=False, auto_delete=True)

        print(f"[x] Esperando mensagens na fila '{QUEUE_INPUT}'...")

    def _callback(self, ch, method, properties, body):
        try:
            # Decodifica a mensagem recebida
            message = json.loads(body)
            print(f"[x] Mensagem recebida: {message}")

            # Realiza a tradução
            translated_text = self.translator.translate(
                message["text"],
                message["source_language"],
                message["target_language"],
            )

            # Cria a resposta
            response = {
                "original_text": message["text"],
                "translated_text": translated_text,
                "source_language": message["source_language"],
                "target_language": message["target_language"],
            }

            # Publica a resposta na fila especificada pelo `reply_to`
            ch.basic_publish(
                exchange="",
                routing_key=properties.reply_to,
                body=json.dumps(response),
                properties=pika.BasicProperties(
                    correlation_id=properties.correlation_id  # Correlaciona com a requisição original
                )
            )
            print(f"[x] Resposta enviada: {response}")

            # Confirma o processamento da mensagem
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            print(f"[!] Erro ao processar mensagem: {str(e)}")
            ch.basic_ack(delivery_tag=method.delivery_tag)

    def start(self):
        # Configura o consumidor para a fila de entrada
        self.channel.basic_consume(queue=QUEUE_INPUT, on_message_callback=self._callback)
        self.channel.start_consuming()
