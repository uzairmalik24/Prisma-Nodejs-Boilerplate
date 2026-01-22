import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';



const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

export async function hashPassword(plainPassword) {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
}

export async function comparePassword(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}