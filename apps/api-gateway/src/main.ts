import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module.js';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  await app.listen(process.env.PORT_API_GATEWAY ?? process.env.PORT ?? 3000);
}
await bootstrap();
