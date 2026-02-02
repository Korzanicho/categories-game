# Instrukcja deploymentu

## Wymagania na serwerze

- Docker i Docker Compose
- Git
- Nginx (dla reverse proxy)

## Konfiguracja serwera

### 1. Przygotowanie katalogu na serwerze

```bash
sudo mkdir -p /opt/categories-game
sudo chown $USER:$USER /opt/categories-game
cd /opt/categories-game
git clone <twoje-repo-url> .
```

### 2. Konfiguracja Nginx

Utwórz plik `/etc/nginx/sites-available/panstwa-miasta.webkor.pl`:

```nginx
server {
    listen 80;
    server_name panstwa-miasta.webkor.pl;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktywuj konfigurację:

```bash
sudo ln -s /etc/nginx/sites-available/panstwa-miasta.webkor.pl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Konfiguracja SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d panstwa-miasta.webkor.pl
```

### 4. Konfiguracja GitHub Secrets

W repozytorium GitHub przejdź do Settings → Secrets and variables → Actions i dodaj:

- `SSH_PRIVATE_KEY` - klucz prywatny SSH do serwera
- `SERVER_HOST` - IP lub domena serwera (np. `123.45.67.89`)
- `SERVER_USER` - użytkownik SSH (np. `ubuntu` lub `root`)

### 5. Generowanie klucza SSH

Na lokalnym komputerze:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
```

Skopiuj klucz publiczny na serwer:

```bash
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server
```

Skopiuj zawartość klucza prywatnego:

```bash
cat ~/.ssh/github_actions
```

I wklej jako `SSH_PRIVATE_KEY` w GitHub Secrets.

### 6. Pierwsze uruchomienie

Na serwerze:

```bash
cd /opt/categories-game
docker-compose up -d --build
```

### 7. Sprawdzenie statusu

```bash
docker-compose ps
docker-compose logs -f
```

## Automatyczny deployment

Po skonfigurowaniu GitHub Actions, każdy push do brancha `master` automatycznie:

1. Połączy się z serwerem przez SSH
2. Pobierze najnowszy kod (`git pull`)
3. Zbuduje nowe obrazy Docker
4. Zrestartuje kontenery

## Ręczne deployment

Jeśli chcesz zaktualizować ręcznie:

```bash
cd /opt/categories-game
git pull origin master
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Logi

```bash
# Wszystkie logi
docker-compose logs -f

# Tylko backend
docker-compose logs -f server

# Tylko frontend
docker-compose logs -f client
```

## Restart

```bash
docker-compose restart
```

## Backup

Jeśli używasz bazy danych, pamiętaj o backupie:

```bash
docker-compose exec db mysqldump -u root -p categories_game > backup.sql
```
