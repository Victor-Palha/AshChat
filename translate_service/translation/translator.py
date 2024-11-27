from deep_translator import GoogleTranslator

class Translator:
    def __init__(self,):
        self.translator = GoogleTranslator()

    def translate(self, text, source_language, target_language):
        self.translator.source = source_language
        self.translator.target = target_language

        input_text = f"translate {source_language} to {target_language}: {text}"
        print(input_text)

        # Gera a tradução
        translated_text = self.translator.translate(text=text)

        print(f"Texto traduzido: {translated_text}")

        return translated_text