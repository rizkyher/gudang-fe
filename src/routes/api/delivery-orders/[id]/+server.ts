import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serializeDeliveryOrder } from '$lib/server/api';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const id = Number(params.id);
	const deliveryOrder = await locals.db.delivery_orders.findUnique({
		where: { id },
		include: {
			inventory_requests: {
				include: {
					users: true,
					inventory_request_items: {
						include: {
							items: true
						}
					}
				}
			}
		}
	});

	if (!deliveryOrder) return json({ message: 'Delivery order not found' }, { status: 404 });
	return json(serializeDeliveryOrder(deliveryOrder));
};
