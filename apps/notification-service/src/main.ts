import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { getRabbitMqUrls } from './rabbitmq.config.js';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: getRabbitMqUrls(),
      queue: 'notification_queue',
      queueOptions: {
        durable: true
      }
    }
  });


  await app.startAllMicroservices();

  Logger.log('Init rabbitmq...')
}
await bootstrap();
