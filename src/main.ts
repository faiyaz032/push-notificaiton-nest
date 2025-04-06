import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Push Notification API')
    .setDescription('API for sending and scheduling push notifications')
    .setVersion('1.0')
    .addTag('push-notifications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          field: error.property,
          message: error.constraints![Object.keys(error.constraints!)[0]],
        }));
        return new UnprocessableEntityException(result);
      },
      stopAtFirstError: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
