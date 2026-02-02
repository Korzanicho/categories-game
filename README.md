# Państwa Miasta - Gra Multiplayer

Aplikacja do gry w Państwa Miasta z obsługą wielu graczy przez WebSocket.

## Technologie

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Baza danych**: MariaDB (opcjonalna - aplikacja działa w pamięci)

## Funkcjonalności

- ✅ Tworzenie i dołączanie do gier
- ✅ System poczekalni z gotowością graczy
- ✅ Losowanie literki przez koło fortuny
- ✅ Rozgrywka z timerem
- ✅ System oceniania odpowiedzi
- ✅ Tabela wyników
- ✅ Responsywny design (przeglądarka + mobile)

## Szybki start

Zobacz [INSTALLATION.md](INSTALLATION.md) dla szczegółowych instrukcji.

```bash
# Instalacja
npm run install:all

# Uruchomienie
npm run dev
```

To uruchomi jednocześnie serwer (port 3003) i klienta (port 3002).

## Struktura projektu

- `client/` - Frontend React + TypeScript
- `server/` - Backend Node.js
- `database/` - Skrypty SQL

## Punktacja

- **0 punktów** - brak odpowiedzi lub błędna odpowiedź
- **5 punktów** - poprawna odpowiedź
- **10 punktów** - unikalna odpowiedź
