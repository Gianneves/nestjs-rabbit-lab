# nestjs-rabbit-lab 🐰

Laboratório hands-on de **microsserviços com NestJS + RabbitMQ**: um fluxo de pedido
orientado a eventos passando por gateway, pedidos, pagamentos e notificações.

> Projeto de **estudos** — o objetivo é aprender na prática como serviços NestJS
> conversam via RabbitMQ (`emit` / `@MessagePattern`), como subir um monorepo com
> vários apps e como diagnosticar os erros clássicos (porta em uso, fila com typo,
> microservice que nunca conecta).

## Arquitetura

```
POST :3000/order
  └─ api-gateway  ──emit('order-created')──▶  order_queue
       └─ order-service  ──emit('process-payment')──▶  payment_queue
       │                  ──emit('order-created')─────▶  notification_queue
       └─ payment-service ──emit('payment-succeed')──▶  notification_queue
                             └─ notification-service (só consome, sem HTTP)
```

| Serviço                | HTTP  | Ouve (fila)        | Emite (eventos)                          | Tipo no Nest                              |
| ---------------------- | ----- | ------------------ | ---------------------------------------- | ----------------------------------------- |
| `api-gateway`          | 3000  | —                  | `order-created`                          | `create()` + `ClientsModule`              |
| `order-service`        | —     | `order_queue`      | `process-payment`, `order-created`       | `createMicroservice()` (só fila)          |
| `payment-service`      | 3002  | `payment_queue`    | `payment-succeed`                        | híbrido: `connectMicroservice()` + HTTP   |
| `notification-service` | —     | `notification_queue` | —                                      | híbrido: `connectMicroservice()` sem HTTP |
| `order-rabbitmq`       | 3001  | —                  | —                                        | app template do `nest new` (não participa do fluxo) |

Conceito-chave: `connectMicroservice()` só **registra** a fila; quem realmente
conecta e passa a consumir os `@MessagePattern` é o **`startAllMicroservices()`**.
Sem ele, o serviço sobe o HTTP mas nunca recebe mensagens (foi o bug real do
`payment-service` aqui).

## Pré-requisitos

- Node 24+, npm, Docker + Docker Compose
- Portas livres: `3000`, `3002`, `5672` (AMQP), `15672` (painel RabbitMQ)

## Setup

```bash
npm install
cp .env.example .env   # ajuste usuário/senha se quiser
docker compose up -d rabbitmq
```

### Variáveis (`.env`)

| Var                  | Default                             | Onde usa                                        |
| -------------------- | ----------------------------------- | ----------------------------------------------- |
| `RABBITMQ_USER`      | `guest`                             | `docker-compose.yml` + todos os serviços        |
| `RABBITMQ_PASS`      | `guest`                             | `docker-compose.yml` + todos os serviços        |
| `RABBITMQ_HOST`      | `localhost`                         | serviços (`rabbitmq.config.ts` de cada app)     |
| `RABBITMQ_PORT`      | `5672`                              | serviços + mapeamento de porta do compose       |
| `RABBITMQ_URL`       | `amqp://guest:guest@localhost:5672` | tem prioridade sobre os 4 campos acima          |
| `PORT_API_GATEWAY`   | `3000`                              | `api-gateway`                                   |
| `PORT_ORDER_RABBITMQ`| `3001`                              | app template `order-rabbitmq`                   |
| `PORT_PAYMENT`       | `3002`                              | `payment-service`                               |

> Sem `.env` tudo continua funcionando com os defaults locais — o `.env` só é
> necessário quando você muda usuário/senha/host. O `.env` **não vai para o git**
> (está no `.gitignore`); o `.env.example` é a referência commitada.
> Detalhe de estudo: cada app tem seu `src/rabbitmq.config.ts` porque o
> `tsconfig` de cada projeto inclui só o próprio `src/` — o próximo passo seria
> extrair isso para um pacote compartilhado em `libs/`.

## Como rodar

```bash
# tudo de uma vez (1 terminal, logs com prefixo e cor por serviço)
npm run start:dev:all

# ou um serviço por terminal
npm run start:dev:api-gateway          # :3000
npm run start:dev:order-service       # só fila
npm run start:dev:payment-service     # :3002 + fila
npm run start:dev:notification-service # só fila
```

Painel do RabbitMQ: http://localhost:15672 (login do `.env`).

## Testando o fluxo

```bash
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -d '{"id":1,"item":"camiseta","value":99.9}'
# → {"message":"Order sent to RabbitMQ", ...}
```

Logs esperados (um em cada serviço):

```
[Order-Service]: Received new order: {...}
[Payment Service] Payment in process {...}
[Notification Service] Sending Order Created Email {...}
[Notification Service] Sending Payment Succeed Email {...}
```

Dica de verificação: no painel ou via
`docker exec rabbitmq rabbitmqctl list_queues name consumers messages` —
após o POST as 3 filas devem voltar a `0` mensagens (tudo consumido).

## Erros que já mordemos aqui (e como evitar)

1. **`npm run start:dev --payment-service --watch` não seleciona o projeto.**
   Sem o separador `--`, o npm engole as flags (`Unknown cli config`) e roda só
   `nest start --watch`, que sobe o app default (`order-rabbitmq` na `:3000`).
   Use `npx nest start payment-service --watch` ou os scripts `start:dev:*`.
2. **`EADDRINUSE :::3000`.** Era o `api-gateway` (3000) colidindo com o app
   default (que também usava 3000). O template foi movido para `3001`.
3. **Notification nunca logava.** Typo de fila: serviços emitiam para
   `notification_queue`, mas o listener estava em `notificaiton_queue`
   (fila órfã, 0 consumers). Confira sempre os nomes nos dois lados.
4. **Microservice que não consome.** `connectMicroservice()` sem
   `startAllMicroservices()` = HTTP no ar, fila muda. O log
   `Nest microservice successfully started` é o sinal de que conectou.

## Scripts úteis

| Comando                  | O que faz                                    |
| ------------------------ | -------------------------------------------- |
| `npm run start:dev:all`  | sobe gateway + order + payment + notify      |
| `npm run start:dev:<app>`| sobe um serviço (`api-gateway`, `order-service`, `payment-service`, `notification-service`, `order-rabbitmq`) |
| `npm run build` / `nest build <app>` | compila (builder rspack)          |
| `npm test`               | testes unitários (vitest)                    |

## Próximos estudos

- [ ] DLX + retry com backoff para falhas de pagamento
- [ ] Idempotência no `order-created` (mesmo pedido entregue 2x)
- [ ] Extrair `rabbitmq.config.ts` para `libs/` compartilhada
- [ ] Migrar `emit` (fire-and-forget) para `send` (request/response) onde precisa de resposta
- [ ] Subir cada serviço como container no compose
