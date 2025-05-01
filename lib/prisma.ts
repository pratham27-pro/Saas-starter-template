import { PrismaClient } from "@prisma/client/extension";


const prismaClientSingleton = () => {
    return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {prisma: PrismaClient | undefined};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


// Purpose of this File
// This file ensures that if the connection is already made then multiple calls are not made to the DB.
// This code is highly usable; fetched directly from the docs
