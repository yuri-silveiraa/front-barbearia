# Docker - Barbearia Frontend

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `.dockerignore` | Arquivos ignorados no build |
| `Dockerfile` | Imagem para desenvolvimento |
| `Dockerfile.prod` | Imagem para produção (multi-stage) |
| `nginx.conf` | Configuração do Nginx para produção |
| `docker-compose.yml` | Compose para desenvolvimento |
| `docker-compose.prod.yml` | Compose para produção |

---

## Desenvolvimento

### Pré-requisitos
- Docker instalado
- Docker Compose instalado

### Como rodar

```bash
# Subir todos os serviços (frontend + backend + database)
docker-compose up

# Ou em modo detached
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: localhost:5432

---

## Produção

### Como rodar

```bash
# Build e subir serviços
docker-compose -f docker-compose.prod.yml up --build

# Ou em modo detached
docker-compose -f docker-compose.prod.yml up -d --build

# Parar serviços
docker-compose -f docker-compose.prod.yml down
```

### URLs
- Frontend: http://localhost
- Backend: http://localhost:3000

---

## Variáveis de Ambiente

### Desenvolvimento
O frontend usa proxy para o backend. No `docker-compose.yml`, o serviço `backend` deve estar configurado para aceitar conexões de dentro da rede Docker.

### Produção
O Nginx redireciona `/api/` para o serviço `backend`.

---

## Build da imagem de produção apenas

```bash
docker build -f Dockerfile.prod -t barbearia-front:prod .
```

## Run da imagem de produção

```bash
docker run -p 80:80 barbearia-front:prod
```
