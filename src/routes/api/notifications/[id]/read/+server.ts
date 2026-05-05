import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const id = Number(params.id);
	const notification = await locals.db.notifications.findUnique({
		where: { id }
	});

	if (!notification) return json({ message: 'Notification not found' }, { status: 404 });
	if (notification.user_id !== locals.user.id && locals.user.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const updated = await locals.db.notifications.update({
		where: { id },
		data: {
			is_read: true,
			updated_at: new Date()
		}
	});

	return json(updated);
};
