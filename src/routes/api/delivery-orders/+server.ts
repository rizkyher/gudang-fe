import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DeliveryOrderSchema } from '$lib/server/schemas';
import { serializeDeliveryOrder } from '$lib/server/api';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const deliveryOrders = await locals.db.delivery_orders.findMany({
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
		},
		orderBy: { created_at: 'desc' }
	});
	
	return json(deliveryOrders.map(serializeDeliveryOrder));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') return json({ message: 'Unauthorized' }, { status: 403 });

	const data = await request.json();
	const parsed = DeliveryOrderSchema.safeParse(data);

	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	const doData = parsed.data;

	const inventoryReq = await locals.db.inventory_requests.findUnique({
		where: { id: doData.inventory_request_id },
		include: { inventory_request_items: { include: { items: true } } }
	});

	if (!inventoryReq) return json({ message: 'Request not found' }, { status: 404 });
	if (inventoryReq.status !== 'processed' && inventoryReq.status !== 'ready') {
		return json({ message: 'Permintaan belum diproses atau sudah selesai.' }, { status: 400 });
	}

	try {
		const doNumber = 'DO-' + Math.random().toString(36).substring(2, 10).toUpperCase();

		const deliveryOrder = await locals.db.$transaction(async (tx: any) => {
			// Deduct stock
			for (const reqItem of inventoryReq.inventory_request_items) {
				const item = reqItem.items;
				if (item.stock < reqItem.quantity) {
					throw new Error(`Stok barang ${item.name} tidak mencukupi.`);
				}
				await tx.items.update({
					where: { id: item.id },
					data: { stock: { decrement: reqItem.quantity } }
				});
			}

			// Update request status
			await tx.inventory_requests.update({
				where: { id: inventoryReq.id },
				data: { status: 'completed' }
			});

			// Create DO
			const newDo = await tx.delivery_orders.create({
				data: {
					do_number: doNumber,
					inventory_request_id: inventoryReq.id,
					driver_name: doData.driver_name,
					license_plate: doData.license_plate,
					status: 'delivered',
					notes: doData.notes || null,
					created_at: new Date(),
					updated_at: new Date()
				}
			});

			return newDo;
		});

		const fullDo = await locals.db.delivery_orders.findUnique({
			where: { id: deliveryOrder.id },
			include: { inventory_requests: { include: { users: true, inventory_request_items: { include: { items: true } } } } }
		});

		return json(serializeDeliveryOrder(fullDo), { status: 201 });
	} catch (error: any) {
		return json({ message: error.message }, { status: 400 });
	}
};
