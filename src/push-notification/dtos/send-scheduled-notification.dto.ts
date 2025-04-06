import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class SendScheduleNotificationDto {
  @IsNotEmpty({ message: 'title is required.' })
  @IsString({ message: 'title must be a string.' })
  title: string;

  @IsNotEmpty({ message: 'message is required.' })
  @IsString({ message: 'message must be a string.' })
  message: string;

  @IsNotEmpty({ message: 'Scheduled time is required.' })
  @IsISO8601(
    {},
    {
      message:
        'Scheduled time must be in ISO 8601 format (e.g., "2025-04-05T17:00:00.000Z").',
    },
  )
  scheduledAt: Date;
}
