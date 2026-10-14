import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller.js';
import { ApiGatewayService } from './api-gateway.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_SERVICE_RABBITMQ } from './constans.js';
import { getRabbitMqUrls } from './rabbitmq.config.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE_RABBITMQ,
        transport: Transport.RMQ,
        options: {
          urls: getRabbitMqUrls(),
          queue: 'order_queue',
          queueOptions: {
            durable: true,
          }
        }
      }
    ])
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
