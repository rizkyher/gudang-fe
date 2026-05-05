import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const notifications = await locals.db.notifications.findMany({
		where: { user_id: Number(locals.user.id) },
		orderBy: { created_at: 'desc' }
	});
	
	return json(notifications);
};
