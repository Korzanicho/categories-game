# Instrukcja instalacji i uruchomienia

## Wymagania

- Node.js (wersja 18 lub nowsza)
- MariaDB (lub MySQL)
- npm lub yarn

## Instalacja

1. Zainstaluj zależności dla całego projektu:
```bash
npm run install:all
```

Lub ręcznie:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

## Konfiguracja bazy danych

1. Zaloguj się do MariaDB:
```bash
mysql -u root -p
```

2. Uruchom skrypty SQL:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Lub w konsoli MySQL:
```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

## Konfiguracja środowiska

### Backend

1. Skopiuj plik przykładowy:
```bash
cp server/.env.example server/.env
```

2. Edytuj plik `server/.env` i uzupełnij dane do połączenia z bazą danych:
```env
PORT=3003
CLIENT_URL=http://localhost:3002

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=twoje_haslo
DB_NAME=categories_game
```

**Gdzie uzupełnić dane do bazy danych:**
- `DB_HOST` - adres hosta bazy danych (domyślnie: localhost)
- `DB_PORT` - port bazy danych (domyślnie: 3306)
- `DB_USER` - nazwa użytkownika bazy danych (domyślnie: root)
- `DB_PASSWORD` - hasło do bazy danych (pozostaw puste jeśli nie ma hasła)
- `DB_NAME` - nazwa bazy danych (domyślnie: categories_game)

### Frontend

1. Skopiuj plik przykładowy:
```bash
cp client/.env.example client/.env
```

2. Edytuj plik `client/.env` jeśli potrzebujesz zmienić URL serwera:
```env
VITE_SERVER_URL=http://localhost:3003
```

## Uruchomienie

### Tryb deweloperski (oba serwery jednocześnie)

Z głównego katalogu projektu:
```bash
npm run dev
```

To uruchomi:
- Backend na porcie 3003
- Frontend na porcie 3002

### Test na telefonie (ta sama sieć Wi‑Fi)

1. Uruchom `npm run dev` na komputerze.
2. Sprawdź adres IP komputera w sieci (np. w Windows: `ipconfig`, szukaj IPv4 dla Wi‑Fi).
3. Na telefonie (podłączonym do tej samej sieci Wi‑Fi) otwórz przeglądarkę i wejdź na: `http://<IP-komputera>:3002` (np. `http://192.168.1.100:3002`).
4. Aplikacja powinna działać – Socket.io idzie przez proxy Vite do backendu na komputerze.

### Ręczne uruchomienie

**Backend:**
```bash
cd server
npm run dev
```

**Frontend (w osobnym terminalu):**
```bash
cd client
npm run dev
```

## Użycie

1. Otwórz przeglądarkę i przejdź do `http://localhost:3002`
2. Utwórz grę lub dołącz do istniejącej gry używając kodu pokoju
3. Graj!

## Uwagi

- Aplikacja używa WebSocket do komunikacji w czasie rzeczywistym
- Baza danych jest opcjonalna - aplikacja działa w trybie pamięci (dane są tracone po restarcie serwera)
- Aby używać bazy danych, należy zintegrować kod w `server/src/index.js` z MariaDB
