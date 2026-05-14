import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4000', 'https://trend-board-two.vercel.app'],
  });
  await app.listen(3000);
}
bootstrap();
