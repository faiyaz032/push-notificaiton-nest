import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
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
}
