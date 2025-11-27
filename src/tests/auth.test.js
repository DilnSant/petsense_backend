import request from 'supertest';
import app from '../app.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
    });
});
