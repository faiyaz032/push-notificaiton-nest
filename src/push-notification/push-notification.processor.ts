import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PushNotificationService } from './push-notification.service';
import { NotificationJobData } from 'src/common/types/NotificationJobData.type';
import { NOTIFICATION_QUEUE } from 'src/config/tokens';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: PushNotificationService) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    const notificationData = job.data;

    try {
      // Call the main send notification service function
      await this.notificationService.sendPushNotification(notificationData);
    } catch (error) {
      this.logger.error(
        `Failed to send notification to deviceToken: ${notificationData.deviceToken}`,
        error,
      );
    }
  }
}
