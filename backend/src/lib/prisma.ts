import { PrismaClient } from "@prisma/client";

/** Instancia singleton del cliente Prisma para acceso a PostgreSQL. */
export const prisma = new PrismaClient();
