import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { PaymentServiceModule } from './payment-service.module.js';
import { getRabbitMqUrls } from './rabbitmq.config.js';

async function bootstrap() {
  const app = await NestFactory.create(PaymentServiceModule);
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: getRabbitMqUrls(),
        queue: 'payment_queue',
        queueOptions: {
          durable: true,
        }
      }
    }
  );


  await app.startAllMicroservices();

  const port = process.env.PORT_PAYMENT ?? process.env.PORT ?? 3002;
  await app.listen(port);
  Logger.log(`Payment-service HTTP listening on ${port}`);
  Logger.log('Payment-service listening on RabbitMQ (payment_queue)...');
}
await bootstrap();
