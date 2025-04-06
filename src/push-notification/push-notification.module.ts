import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';
import { UserModule } from 'src/user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from 'src/config/tokens';
import { NotificationProcessor } from './push-notification.processor';

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATION_QUEUE }), UserModule],
  providers: [PushNotificationService, NotificationProcessor],
  controllers: [PushNotificationController],
})
export class PushNotificationModule {}
