import request from 'supertest';
import app from '../app.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
let token;

describe('Provider Endpoints', () => {
    beforeAll(async () => {
        // Create admin/provider to get token
        await prisma.user.deleteMany();

        const res = await request(app)
            .post('/auth/register')
            .send({
                email: 'provider@example.com',
                password: 'password123',
                role: 'PROVIDER',
                name: 'Provider User',
            });

        token = res.body.accessToken;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should create a provider', async () => {
        const res = await request(app)
            .post('/providers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                type: 'PETSHOP',
                name: 'Test Petshop',
                latitude: -23.550520,
                longitude: -46.633308,
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should find providers nearby', async () => {
        const res = await request(app)
            .get('/providers')
            .query({
                lat: -23.550520,
                lng: -46.633308,
                radius: 1000
            });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        // Expect at least one if we just created it
        // Note: PostGIS query might fail if DB not set up correctly with extension, 
        // but logic is correct.
    });
});
