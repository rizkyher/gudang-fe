import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

import { PrismaLibSql } from '@prisma/adapter-libsql';

// Handle BigInt serialization for JSON
(BigInt.prototype as any).toJSON = function () {
	return Number(this);
};

import { dev } from '$app/environment';

let prismaClient: PrismaClient;

export function getPrisma(env?: any) {
	if (prismaClient) return prismaClient;

	if (!dev && env && env.DB) {
		// Production: Gunakan binding D1 asli dari Cloudflare
		const adapter = new PrismaD1(env.DB);
		prismaClient = new PrismaClient({ adapter });
	} else {
		// Fallback untuk local development (bun dev) -> Gunakan dev.db yang sudah di-seed
		const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
		prismaClient = new PrismaClient({ adapter });
	}

	return prismaClient;
}
