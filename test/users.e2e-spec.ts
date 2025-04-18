import * as request from 'supertest';
import { getApp } from './setup';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedTestData } from '../../auth-service/backend/test/seed';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    app = getApp();
    dataSource = app.get(DataSource);
    
    // Seed test data
    await seedTestData(dataSource);

    // Get auth token for authenticated requests
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test1@example.com',
        password: 'Test123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    await dataSource.getRepository('User').delete({});
    await app.close();
  });

  describe('User Management', () => {
    it('should get all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
        });
    });

    it('should get user by email', () => {
      return request(app.getHttpServer())
        .get('/users/email/test1@example.com')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test1@example.com');
          expect(res.body.firstName).toBe('Test');
          expect(res.body.lastName).toBe('User1');
        });
    });

    it('should get user by ID', async () => {
      // First get a user to get their ID
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      const userId = usersResponse.body[0].id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('firstName');
          expect(res.body).toHaveProperty('lastName');
        });
    });

    it('should update user profile', async () => {
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      const userId = usersResponse.body[0].id;

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toBe('Updated');
          expect(res.body.lastName).toBe('Name');
        });
    });

    it('should not allow unauthenticated access', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });
}); 