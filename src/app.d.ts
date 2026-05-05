declare global {
	namespace App {
		interface Locals {
			user?: {
				id: number;
				name: string;
				email: string;
				role: string;
			};
			db: import('@prisma/client').PrismaClient;
		}

		interface Platform {
			env?: {
				DB?: import('@cloudflare/workers-types').D1Database;
			};
			context?: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches?: import('@cloudflare/workers-types').CacheStorage & {
				default: import('@cloudflare/workers-types').Cache;
			};
		}
	}
}

export {};
