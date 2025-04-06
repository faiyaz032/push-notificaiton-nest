import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from 'src/config/tokens';
import { UserService } from 'src/user/user.service';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { ConfigService } from '@nestjs/config';
import { NotificationJobData } from 'src/common/types/NotificationJobData.type';
import { SendScheduleNotificationDto } from './dtos/send-scheduled-notification.dto';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async enqueueNotification(notificationData: SendNotificationDto) {
    await this.processInBatches(notificationData, 'sendNotification');
    this.logger.log('All notifications have been enqueued.');
  }

  async enqueueScheduleNotification(
    notificationData: SendScheduleNotificationDto,
  ) {
    const { scheduledAt } = notificationData;

    const scheduledDate = new Date(scheduledAt!);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future.');
    }

    const delay = scheduledDate.getTime() - Date.now();
    await this.processInBatches(
      notificationData,
      'sendScheduledNotification',
      delay,
    );
    this.logger.log('All scheduled notifications have been enqueued.');
  }

  private async processInBatches(
    notificationData: SendNotificationDto | SendScheduleNotificationDto,
    jobPrefix: string,
    delay?: number, // optional now
  ) {
    const batchSize = this.configService.getOrThrow<number>('push.batchSize');
    const attempts =
      this.configService.getOrThrow<number>('push.retryAttempts');
    const retryDelay = this.configService.getOrThrow<number>('push.retryDelay');

    let page = 1;

    while (true) {
      const users = await this.userService.findAll(page, batchSize);
      if (users.length === 0) break;

      const jobs = users.map((user) => {
        const jobOptions: any = {
          attempts,
          backoff: {
            type: 'fixed',
            delay: retryDelay,
          },
        };

        if (delay !== undefined) {
          jobOptions.delay = delay;
        }

        return {
          name: `${jobPrefix}-${user.id}`,
          data: {
            deviceToken: user.deviceToken,
            title: notificationData.title,
            message: notificationData.message,
          } as NotificationJobData,
          opts: jobOptions,
        };
      });

      await this.notificationQueue.addBulk(jobs);
      this.logger.log(
        `${delay ? 'Scheduled' : 'Enqueued'} batch ${page} with ${users.length} jobs.`,
      );

      page++;
    }
  }

  // Simulate actual push logic
  async sendPushNotification(notificationData: NotificationJobData) {
    const { deviceToken, title, message } = notificationData;
    this.logger.log(
      `Sending notification to ${deviceToken}: ${title} - ${message}`,
    );
  }
}
