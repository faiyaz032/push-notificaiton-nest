import { IsNotEmpty, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsNotEmpty({ message: 'title is required.' })
  @IsString({ message: 'title must be a string.' })
  title: string;

  @IsNotEmpty({ message: 'message is required.' })
  @IsString({ message: 'message must be a string.' })
  message: string;
}
