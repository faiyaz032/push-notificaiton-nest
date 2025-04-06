import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from 'src/config/tokens';
import { UserService } from 'src/user/user.service';
import { SendScheduleNotificationDto } from './dtos/send-scheduled-notification.dto';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { ConfigService } from '@nestjs/config';
import { NotificationJobData } from 'src/common/types/NotificationJobData.type';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async enqueueNotification(notificationData: SendNotificationDto) {
    const batchSize = this.configService.getOrThrow('push.batchSize');

    let page = 1;

    while (true) {
      const users = await this.userService.findAll(page, batchSize);

      if (users.length === 0) break;

      const jobs = users.map((user) => ({
        name: `sendNotification-${user.id}`,
        data: {
          deviceToken: user.deviceToken,
          title: notificationData.title,
          message: notificationData.message,
        } as NotificationJobData,
        opts: {
          attempts: this.configService.getOrThrow('push.retryAttempts'),
          backoff: {
            type: 'fixed',
            delay: this.configService.getOrThrow('push.retryDelay'),
          },
        },
      }));

      await this.notificationQueue.addBulk(jobs);

      this.logger.log(`Enqueued batch ${page} with ${users.length} jobs.`);
      page++;
    }

    this.logger.log('All notifications have been enqueued.');
  }

  async enqueueScheduleNotification(
    scheduledNotificationData: SendScheduleNotificationDto,
  ) {
    console.log('Sending schedule notification to all users...');
  }

  // Main function to send notification using expo or fcm
  async sendNotification(notificationData: NotificationJobData) {
    const { deviceToken, title, message } = notificationData;
    // Simulate sending notification
    this.logger.log(
      `Sending notification to ${deviceToken}: ${title} - ${message}`,
    );
  }
}
