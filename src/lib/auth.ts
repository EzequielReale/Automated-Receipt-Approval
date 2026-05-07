import { SignJWT, jwtVerify } from 'jose';
import { User } from './types';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-demo');

export async function createToken(user: User) {
  return await new SignJWT({ sub: user.id, role: user.role, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}
