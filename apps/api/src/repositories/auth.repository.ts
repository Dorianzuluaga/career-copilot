import type { User } from "../../generated/prisma/index.js";
import { prisma } from "../lib/prisma.js";

export interface GoogleUser {
  googleSub: string;
  email: string;
  name: string;
  avatar: string | null;
}

export async function createUserSession(
  googleUser: GoogleUser,
  sessionId: string,
  expiresAt: Date,
): Promise<User> {
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { googleSub: googleUser.googleSub },
      create: googleUser,
      update: {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar,
      },
    });

    await transaction.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt,
      },
    });

    return user;
  });
}

export async function findUserBySessionId(
  sessionId: string,
): Promise<User | null> {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  return session?.user ?? null;
}
