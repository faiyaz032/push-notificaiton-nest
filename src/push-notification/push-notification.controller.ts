import { Body, Controller, Post } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { SendScheduleNotificationDto } from './dtos/send-scheduled-notification.dto';

@Controller('push-notification')
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Post('send-now')
  async sendNow(@Body() notificationDto: SendNotificationDto) {
    return this.pushNotificationService.sendNotification(notificationDto);
  }

  @Post('schedule')
  async schedule(@Body() scheduleNotificationDto: SendScheduleNotificationDto) {
    return this.pushNotificationService.sendScheduleNotification(
      scheduleNotificationDto,
    );
  }
}
