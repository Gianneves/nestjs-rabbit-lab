import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller.js';
import { OrderServiceService } from './order-service.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATION_CLIENT, PAYMENT_CLIENT } from './contants.js';
import { getRabbitMqUrls } from './rabbitmq.config.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PAYMENT_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: getRabbitMqUrls(),
          queue: 'payment_queue',
          queueOptions: {
            durable: true,
          }
        }
      }
    ]),
    ClientsModule.register([
      {
        name: NOTIFICATION_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: getRabbitMqUrls(),
          queue: 'notification_queue',
          queueOptions: {
            durable: true,
          }
        }
      }
    ])
  ],
  controllers: [OrderServiceController],
  providers: [OrderServiceService],
})
export class OrderServiceModule { }
