from deep_translator import GoogleTranslator
from deep_translator.exceptions import LanguageNotSupportedException

class Translator:
    def __init__(self,):
        self.translator = GoogleTranslator()

    def translate(self, text, source_language, target_language):
        try:
            self.translator.source = source_language
        except LanguageNotSupportedException as e:
            print(f"Erro: {e}")
            self.translator.source = "auto"
        
        try:
            self.translator.target = target_language
        except LanguageNotSupportedException as e:
            print(f"Erro: {e}")
            self.translator.target = "en"
            
        
        input_text = f"translate {source_language} to {target_language}: {text}"
        print(input_text)

        # Gera a tradução
        translated_text = self.translator.translate(text=text)

        print(f"Texto traduzido: {translated_text}")

        return translated_text
