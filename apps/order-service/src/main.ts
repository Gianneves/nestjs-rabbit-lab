import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { getRabbitMqUrls } from './rabbitmq.config.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrderServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: getRabbitMqUrls(),
        queue: 'order_queue',
        queueOptions: {
          durable: true,
        }
      }
    }
  );
  await app.listen();
  Logger.log('Application is listening on RabbitMQ...');
}
await bootstrap();
