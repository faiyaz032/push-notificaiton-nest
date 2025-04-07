import { Body, Controller, Post } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { SendScheduleNotificationDto } from './dtos/send-scheduled-notification.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('push-notifications')
@Controller('push-notification')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post('send-now')
  @ApiOperation({ summary: 'Send a push notification immediately' })
  @ApiResponse({
    status: 201,
    description: 'The notification has been successfully queued for sending',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notifications are being sent' },
      },
    },
  })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async sendNow(@Body() notificationDto: SendNotificationDto) {
    await this.pushNotificationService.enqueueNotification(notificationDto);
    return {
      success: true,
      message: 'Notifications are being sent',
    };
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a push notification for later delivery' })
  @ApiResponse({
    status: 201,
    description: 'The notification has been successfully scheduled',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Scheduled notifications are being sent',
        },
      },
    },
  })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async schedule(@Body() scheduleNotificationDto: SendScheduleNotificationDto) {
    await this.pushNotificationService.enqueueScheduleNotification(scheduleNotificationDto);
    return {
      success: true,
      message: 'Scheduled notifications are being sent',
    };
  }
}
