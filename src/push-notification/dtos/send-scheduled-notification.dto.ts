import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendScheduleNotificationDto {
  @ApiProperty({
    description: 'Title of the notification',
    example: 'New Feature Available',
  })
  @IsNotEmpty({ message: 'title is required.' })
  @IsString({ message: 'title must be a string.' })
  title: string;

  @ApiProperty({
    description: 'Content of the notification message',
    example: 'Check out our latest feature in the app!',
  })
  @IsNotEmpty({ message: 'message is required.' })
  @IsString({ message: 'message must be a string.' })
  message: string;

  @ApiProperty({
    description: 'When the notification should be sent',
    example: '2025-04-10T15:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Scheduled time is required.' })
  @IsISO8601(
    {},
    {
      message: 'Scheduled time must be in ISO 8601 format (e.g., "2025-04-05T17:00:00.000Z").',
    },
  )
  scheduledAt: Date;
}
