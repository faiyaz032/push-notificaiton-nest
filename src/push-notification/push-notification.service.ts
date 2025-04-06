import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from 'src/config/tokens';
import { UserService } from 'src/user/user.service';
import { SendScheduleNotificationDto } from './dtos/send-scheduled-notification.dto';
import { SendNotificationDto } from './dtos/send-notification.dto';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private readonly userService: UserService,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async sendNotification(notificationData: SendNotificationDto) {
    console.log('Sending notification to all users...');
  }

  async sendScheduleNotification(
    scheduledNotificationData: SendScheduleNotificationDto,
  ) {
    console.log('Sending schedule notification to all users...');
  }
}
