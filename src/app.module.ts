import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoversModule } from './modules/movers/movers.module';

@Module({
  imports: [
    // อ่านค่าจากไฟล์ .env แบบ Global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // เชื่อมต่อฐานข้อมูล PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'movers_db'),
        autoLoadEntities: true,
        synchronize: true, // ตั้งเป็น false เมื่อใช้งานบน Production
      }),
    }),

    // นำเข้า Movers Module
    MoversModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}