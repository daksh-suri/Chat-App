import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import env from "../../env.js";

export async function signup({ email, password, name }) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        const err = new Error("Email already exists");
        err.status = 401;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            email,
            password: passwordHash,
            name
        }
    });

    const token = jwt.sign({ name, email, id: user.id }, env.JWT_SECRET);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        token
    };
}



export async function signin({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const err = new Error("Invalid Login email");
        err.status = 401;
        throw err;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        const err = new Error("Invalid Login password");
        err.status = 401;
        throw err;
    }

    const token = jwt.sign({ name: user.name, email, id: user.id }, env.JWT_SECRET);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        token
    };
}