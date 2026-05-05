import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const id = Number(params.id);
	const notification = await locals.db.notifications.findUnique({
		where: { id }
	});

	if (!notification) return json({ message: 'Notification not found' }, { status: 404 });
	if (notification.user_id !== locals.user.id && locals.user.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	await locals.db.notifications.delete({ where: { id } });

	return json({ message: 'Notification deleted' });
};
