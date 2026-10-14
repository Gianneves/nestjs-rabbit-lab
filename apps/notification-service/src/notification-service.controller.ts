import { Controller, Get } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service.js';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationServiceService: NotificationServiceService) { }

  @Get()
  getHello(): string {
    return this.notificationServiceService.getHello();
  }

  @MessagePattern('order-created')
  sendOrderCreatedEmail(@Payload() order: any) {
    console.log('[Notification Service] Sending Order Created Email', order);
  }

  @MessagePattern('payment-succeed')
  sendPaymentSucceedEmail(@Payload() order: any) {
    console.log('[Notification Service] Sending Payment Succeed Email', order);
  }
}
