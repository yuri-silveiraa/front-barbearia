# Barbearia Douglas - Frontend

Frontend React + TypeScript para sistema de agendamento de barbearia.

## Tech Stack

- React 19 + TypeScript
- Vite
- Material-UI v7
- React Router DOM v7
- React Hook Form + Zod
- Zustand (state management)
- Axios

## Variáveis de Ambiente

Criar arquivo `.env`:
```env
VITE_BASE_URL_API=/api
```

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run lint     # Verificar código
npm run preview  # Preview produção
```

## Desenvolvimento Local

1. Instalar dependências:
```bash
npm install
```

2. Rodar em desenvolvimento:
```bash
npm run dev
```

3. Acessar: http://localhost:5173

---

## Docker

### Desenvolvimento
```bash
docker-compose up
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: localhost:5432

### Produção
```bash
docker-compose -f docker-compose.prod.yml up --build
```
- Frontend: http://localhost

Ver [DOCKER.md](DOCKER.md) para instruções detalhadas.

---

## Estrutura do Projeto

```
src/
├── api/            # Serviços de API
├── components/     # Componentes compartilhados
├── contexts/       # React Contexts
├── features/       # Funcionalidades por domínio
│   ├── auth/      # Autenticação
│   ├── barbeiro/  # Páginas do barbeiro
│   ├── perfil/    # Perfil do usuário
│   └── reservas/  # Reservas do cliente
├── hooks/         # Custom hooks
└── layouts/       # Layouts
```

---

## Funcionalidades

### Cliente
- Login e cadastro
- Visualizar reservas
- Criar nova reserva (selecionar barbeiro, serviço, data/horário)
- Editar perfil

### Barbeiro
- Agenda do dia
- Detalhes do agendamento
- Concluir agendamento
- Cancelar agendamento
- Gerenciar horários (em breve)

---

## Licença

MIT
