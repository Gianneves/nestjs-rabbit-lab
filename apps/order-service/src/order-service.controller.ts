import { Controller, Get, Inject } from '@nestjs/common';
import { OrderServiceService } from './order-service.service.js';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { NOTIFICATION_CLIENT, PAYMENT_CLIENT } from './contants.js';

@Controller()
export class OrderServiceController {
  constructor(
    private readonly orderServiceService: OrderServiceService,
    @Inject(PAYMENT_CLIENT)
    private readonly paymentRMQClient: ClientProxy,
    @Inject(NOTIFICATION_CLIENT)
    private readonly notificationRMQClient: ClientProxy,
  ) { }

  @Get()
  getHello(): string {
    return this.orderServiceService.getHello();
  }

  @MessagePattern('order-created')
  handleOrderCreated(@Payload() order: any) {
    console.log('[Order-Service]: Received new order:', order);

    this.paymentRMQClient.emit('process-payment', order);
    this.notificationRMQClient.emit('order-created', order);
  }
}
