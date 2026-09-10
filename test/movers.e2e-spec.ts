import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MoversController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/movers/calculate (POST) - Success 200 OK', () => {
    return request(app.getHttpServer())
      .post('/movers/calculate')
      .send({ period: '1D', type: 'most_volatile', limit: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('period', '1D');
        expect(res.body).toHaveProperty('type', 'most_volatile');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('/movers/calculate (POST) - Validation Fail 400 Bad Request', () => {
    return request(app.getHttpServer())
      .post('/movers/calculate')
      .send({ period: 'INVALID_PERIOD', type: 'wrong_type' })
      .expect(400);
  });
});