import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InventoryRequestSchema } from '$lib/server/schemas';
import { serializeRequest } from '$lib/server/api';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const statusFilter = url.searchParams.get('filter[status]');
	
	const whereClause: any = {};
	if (locals.user.role !== 'admin') {
		whereClause.user_id = Number(locals.user.id);
	}
	if (statusFilter) {
		whereClause.status = statusFilter;
	}

	const requests = await locals.db.inventory_requests.findMany({
		where: whereClause,
		include: {
			users: true,
			inventory_request_items: {
				include: { items: true }
			}
		},
		orderBy: { created_at: 'desc' }
	});
	
	return json(requests.map(serializeRequest));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const parsed = InventoryRequestSchema.safeParse(data);

	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	const requestData = parsed.data;
	const requestNumber = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();

	// Use Prisma transaction to ensure atomicity
	const inventoryRequest = await locals.db.$transaction(async (tx: any) => {
		const req = await tx.inventory_requests.create({
			data: {
				request_number: requestNumber,
				user_id: Number(locals.user!.id),
				status: 'pending',
				notes: requestData.notes || null,
				created_at: new Date(),
				updated_at: new Date()
			}
		});

		for (const item of requestData.items) {
			await tx.inventory_request_items.create({
				data: {
					inventory_request_id: req.id,
					item_id: item.id,
					quantity: Number(item.quantity),
					created_at: new Date(),
					updated_at: new Date()
				}
			});
		}

		return req;
	});

	const fullRequest = await locals.db.inventory_requests.findUnique({
		where: { id: inventoryRequest.id },
		include: {
			users: true,
			inventory_request_items: { include: { items: true } }
		}
	});

	return json(serializeRequest(fullRequest), { status: 201 });
};
