import { Controller, Get, Inject } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service.js';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { NOTIFICATION_CLIENT } from './constants.js';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService,
    @Inject(NOTIFICATION_CLIENT)
    private readonly notification_client: ClientProxy
  ) {}

  @Get()
  getHello(): string {
    return this.paymentServiceService.getHello();
  }

  @MessagePattern('process-payment')
  handleProcessPayment(@Payload() order: any) {
    console.log('[Payment Service] Payment in process', order);

    this.notification_client.emit('payment-succeed', order);
  }
}
