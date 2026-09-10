import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เปิดใช้งาน Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // --- ตั้งค่า Swagger API Documentation ---
  const config = new DocumentBuilder()
    .setTitle('US Stock Market Movers API')
    .setDescription('API สำหรับคำนวณและดึงข้อมูลหุ้นที่มีการเคลื่อนไหวสูง (Gainers, Losers, Most Volatile)')
    .setVersion('1.0')
    .addTag('Movers')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // ----------------------------------------

  await app.listen(3000);
  console.log(`Swagger UI is running on: http://localhost:3000/api`);
}
bootstrap();