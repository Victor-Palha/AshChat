from rabbitmq.consumer import RabbitMQRPCServer
from translation.translator import Translator


def main():
    translator = Translator()

    consumer = RabbitMQRPCServer(translator)
    consumer.start()


if __name__ == "__main__":
    print("Running IA RabbitMQ Translator...")
    main()
