# Docker - Barbearia Frontend

## Arquivos

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
- Backend rodando em `http://localhost:3000`

### Como rodar

```bash
# Subir o frontend
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
- Backend: http://localhost:3000 (já deve estar rodando)

---

## Produção

### Pré-requisitos
- Backend rodando em container ou servidor
- Nome do serviço/container do backend deve ser `backend` (ou alterar no nginx.conf)

### Como rodar

```bash
# Build e subir o frontend
docker-compose -f docker-compose.prod.yml up --build

# Ou em modo detached
docker-compose -f docker-compose.prod.yml up -d --build

# Parar serviços
docker-compose -f docker-compose.prod.yml down
```

### URLs
- Frontend: http://localhost
- Backend: http://localhost:3000 (ou conforme configurado)

---

## Configuração do Backend

### Desenvolvimento
No desenvolvimento, o frontend faz proxy para `http://host.docker.internal:3000`.

Se o seu backend está rodando na máquina host (não em container), adicione no seu `/etc/hosts`:
```
127.0.0.1 host.docker.internal
```

### Produção
O Nginx redireciona `/api/` para `http://backend:3000`.

Se o backend está em outro container Docker, certifique-se de que:
- Estejam na mesma rede Docker
- O nome do serviço/container seja `backend`

Para alterar a URL do backend, edite o arquivo `nginx.conf` e rebuild a imagem.

---

## Build da imagem de produção apenas

```bash
docker build -f Dockerfile.prod -t barbearia-front:prod .
```

## Run da imagem de produção

```bash
docker run -p 80:80 barbearia-front:prod
```

## Variáveis de Ambiente

### Desenvolvimento
- `VITE_BASE_URL_API=/api` - Prefixo da API
- `VITE_PROXY_TARGET=http://host.docker.internal:3000` - Target do proxy
