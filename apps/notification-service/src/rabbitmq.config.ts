// Lê a conexão do RabbitMQ a partir do .env (carregado via `dotenv/config` no main.ts).
// Prioridade: RABBITMQ_URL > RABBITMQ_USER/PASS/HOST/PORT > defaults locais.
export function getRabbitMqUrls(): string[] {
  if (process.env.RABBITMQ_URL) {
    return [process.env.RABBITMQ_URL];
  }
  const user = process.env.RABBITMQ_USER ?? 'guest';
  const pass = process.env.RABBITMQ_PASS ?? 'guest';
  const host = process.env.RABBITMQ_HOST ?? 'localhost';
  const port = process.env.RABBITMQ_PORT ?? '5672';
  return [`amqp://${user}:${pass}@${host}:${port}`];
}
