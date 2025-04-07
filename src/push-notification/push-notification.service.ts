import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
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
    try {
      await this.processInBatches(notificationData, 'sendNotification');
      this.logger.log('All notifications have been enqueued.');
    } catch (error) {
      this.logger.error('Error while enqueuing notifications', error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while processing notifications.');
      }
    }
  }

  async enqueueScheduleNotification(notificationData: SendScheduleNotificationDto) {
    try {
      const { scheduledAt } = notificationData;

      // Validate the scheduledAt field
      const scheduledDate = new Date(scheduledAt!);
      if (scheduledDate <= new Date()) {
        throw new BadRequestException('Scheduled time must be in the future.');
      }

      // Calculate the delay
      const delay = scheduledDate.getTime() - Date.now();

      await this.processInBatches(notificationData, 'sendScheduledNotification', delay);

      this.logger.log('All scheduled notifications have been enqueued.');
    } catch (error) {
      this.logger.error('Error while enqueuing scheduled notifications', error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while processing scheduled notifications.');
      }
    }
  }

  private async processInBatches(
    notificationData: SendNotificationDto | SendScheduleNotificationDto,
    jobPrefix: string,
    delay?: number,
  ) {
    try {
      const batchSize = this.configService.getOrThrow<number>('push.batchSize');
      const attempts = this.configService.getOrThrow<number>('push.retryAttempts');
      const retryDelay = this.configService.getOrThrow<number>('push.retryDelay');

      let page = 1;

      //Batching logic to fetch users in chuck. now it is 10 but im considering it can be 40k in the future.
      while (true) {
        const users = await this.userService.findAll(page, batchSize);
        if (users.length === 0) break;

        const jobs = users.map((user) => {
          const jobOptions: JobsOptions = {
            attempts,
            backoff: {
              type: 'fixed',
              delay: retryDelay,
            },
          };

          if (delay !== undefined) jobOptions.delay = delay;

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

        // Add the jobs as bulk to the queue
        await this.notificationQueue.addBulk(jobs);
        this.logger.log(`${delay ? 'Scheduled' : 'Enqueued'} batch ${page} with ${users.length} jobs.`);

        // Add a page to fetch the next batch of users
        page++;
      }
    } catch (error) {
      this.logger.error('Error while processing notifications in batches', error);
      throw new InternalServerErrorException('An error occurred while processing notifications in batches.');
    }
  }

  // Simulate actual push logic
  async sendPushNotification(notificationData: NotificationJobData) {
    const { deviceToken, title, message } = notificationData;
    this.logger.log(`Sending notification to ${deviceToken}: ${title} - ${message}`);
  }
}
