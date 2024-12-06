import pytest
from translation import Translator

def it_should_translate_text():
    translator = Translator()

    translated_text = translator.translate(
        source_language="pt", target_language="en", text="Olá, mundo!"
    )
    print(translated_text)
    assert translated_text == "Hello World!"


it_should_translate_text()
