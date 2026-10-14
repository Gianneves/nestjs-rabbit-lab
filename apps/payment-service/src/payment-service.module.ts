import { Module } from '@nestjs/common';
import { PaymentServiceController } from './payment-service.controller.js';
import { PaymentServiceService } from './payment-service.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATION_CLIENT } from './constants.js';
import { getRabbitMqUrls } from './rabbitmq.config.js';

@Module({
  imports: [
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
  controllers: [PaymentServiceController],
  providers: [PaymentServiceService],
})
export class PaymentServiceModule {}
