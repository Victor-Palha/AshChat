from rabbitmq.consumer import RabbitMQConsumer
from translation.translator import Translator


def main():
    translator = Translator()

    consumer = RabbitMQConsumer(translator)
    consumer.start()


if __name__ == "__main__":
    print("Running IA RabbitMQ Translator...")
    main()
