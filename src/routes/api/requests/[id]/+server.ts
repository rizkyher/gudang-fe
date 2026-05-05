import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serializeRequest } from '$lib/server/api';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const id = Number(params.id);
	const request = await locals.db.inventory_requests.findUnique({
		where: { id },
		include: {
			users: true,
			inventory_request_items: {
				include: {
					items: true
				}
			}
		}
	});

	if (!request) return json({ message: 'Request not found' }, { status: 404 });
	if (locals.user.role !== 'admin' && request.user_id !== locals.user.id) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	return json(serializeRequest(request));
};
