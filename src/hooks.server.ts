import { verifyToken } from '$lib/server/jwt';
import { getPrisma } from '$lib/server/prisma';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	const db = getPrisma(dev ? undefined : event.platform?.env);
	event.locals.db = db;

	const authHeader = event.request.headers.get('authorization');
	const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
	const token = event.cookies.get('token') ?? bearerToken;

	if (token) {
		const decoded = verifyToken(token) as any;
		if (decoded && decoded.id) {
			const user = await db.users.findUnique({
				where: { id: decoded.id },
				select: { id: true, name: true, email: true, role: true }
			});
			if (user) {
				event.locals.user = user;
			}
		}
	}

	return resolve(event);
};
