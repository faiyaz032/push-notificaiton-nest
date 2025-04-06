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
    await this.pushNotificationService.enqueueNotification(notificationDto);
    return {
      success: true,
      message: 'Notifications are being sent',
    };
  }

  @Post('schedule')
  async schedule(@Body() scheduleNotificationDto: SendScheduleNotificationDto) {
    await this.pushNotificationService.enqueueScheduleNotification(
      scheduleNotificationDto,
    );
    return {
      success: true,
      message: 'Scheduled notifications are being sent',
    };
  }
}
