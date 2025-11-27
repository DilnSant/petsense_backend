import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
};

export const register = async (data) => {
    const { email, password, role, name, phone } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: role || 'USER',
            profile: {
                create: {
                    name,
                    phone,
                },
            },
        },
    });

    return generateTokens(user);
};

export const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    return generateTokens(user);
};

export const refresh = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            throw new Error('User not found');
        }

        return generateTokens(user);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};
