import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service.js';
import { ORDER_SERVICE_RABBITMQ } from './constans.js';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService,
    @Inject(ORDER_SERVICE_RABBITMQ)
    private readonly client: ClientProxy
  ) { }

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Post('order')
  createOrder(@Body() order: any) {
    this.client.emit('order-created', order);
    return { message: 'Order sent to RabbitMQ', order }
  }
}
