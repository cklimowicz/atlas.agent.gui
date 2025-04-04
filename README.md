# Atlas Code-Gen

Responsywny interfejs graficzny do generowania kodu na podstawie kroków testowych z bezpieczną integracją API.

## Instalacja

1. Sklonuj repozytorium
2. Zainstaluj zależności:
   ```
   npm install
   ```
3. Umieść certyfikaty SSL w katalogu głównym projektu:
   - `cert.pem` - certyfikat SSL
   - `key.pem` - klucz prywatny SSL

4. Uruchom serwer deweloperski:
   ```
   npm run dev
   ```

## Konfiguracja certyfikatów

Aplikacja jest skonfigurowana do używania certyfikatów SSL do bezpiecznej komunikacji z API.
Aby włączyć tę funkcję:

1. Umieść pliki certyfikatów bezpośrednio w katalogu głównym projektu:
   - `cert.pem` - certyfikat SSL
   - `key.pem` - klucz prywatny SSL

Jeśli pliki certyfikatów nie zostaną znalezione, aplikacja przejdzie w tryb akceptowania certyfikatów samopodpisanych,
ale nadal możesz napotkać ostrzeżenia dotyczące bezpieczeństwa w przeglądarce.

## Integracja z API

Aplikacja łączy się z API pod adresem `https://localhost:8000`. Jeśli napotkasz problemy z połączeniem:

1. Spróbuj otworzyć API bezpośrednio pod adresem https://localhost:8000/docs w przeglądarce
2. Zaakceptuj ostrzeżenia dotyczące certyfikatu, które się pojawią
3. Wróć do aplikacji i spróbuj ponownie wygenerować kod

## Funkcje

- Konfiguracja agenta z wyborem modeli
- Tworzenie kroków testowych krok po kroku
- Zmiana kolejności kroków metodą przeciągnij i upuść
- Lokalne przechowywanie zapisanych konfiguracji
- Podgląd danych wysyłanych do API w formacie JSON
- Bezpieczna komunikacja HTTPS
- Funkcje dostępności, w tym tryb wysokiego kontrastu
- Zapisywanie wygenerowanego kodu Python do pliku

## Używanie aplikacji

1. **Konfiguracja Agenta**: Wybierz odpowiednie modele AI do generowania kodu
2. **Kroki Testowe**: Wprowadź adres URL strony startowej, nazwę projektu i nazwę testu, a następnie zdefiniuj kroki testowe
3. **Podgląd JSON**: Sprawdź dane, które zostaną wysłane do API
4. **Generowanie kodu**: Kliknij "Generuj Kod", aby wysłać scenariusz do API
5. **Odpowiedź API**: Obejrzyj wygenerowany kod lub diagnostykę błędów
6. **Zapisywanie kodu**: Po wygenerowaniu kodu Python, możesz go zapisać do pliku, który zostanie nazwany według wzoru `nazwa_projektu_nazwa_testu.py`

## Zarządzanie konfiguracjami

- **Zapisz Wersję**: Zachowaj bieżącą konfigurację pod wybraną nazwą
- **Wczytaj Wersję**: Wczytaj wcześniej zapisaną konfigurację
- **Import JSON**: Importuj konfigurację z formatu JSON

## Technologie

Projekt wykorzystuje:
- React z TypeScript
- Tailwind CSS do stylizacji
- react-hook-form do zarządzania formularzami
- zod do walidacji
- react-beautiful-dnd do funkcji przeciągnij i upuść
- react-hot-toast do powiadomień

## Rozwój

Aby rozwijać projekt:

1. Sklonuj repozytorium
2. Zainstaluj zależności: `npm install`
3. Uruchom serwer deweloperski: `npm run dev`
4. Wprowadź zmiany i sprawdź je w przeglądarce
5. Zbuduj produkcyjną wersję: `npm run build`
