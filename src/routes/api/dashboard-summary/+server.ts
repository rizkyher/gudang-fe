import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serializeRequest, serializeItem } from '$lib/server/api';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const totalItems = await locals.db.items.count();
	const pendingRequestsCount = await locals.db.inventory_requests.count({
		where: { status: 'pending' }
	});
	const completedDeliveryOrders = await locals.db.delivery_orders.count({
		where: { status: 'delivered' }
	});
	const totalUsers = await locals.db.users.count();
	const currentMonth = new Date();
	currentMonth.setDate(1);
	currentMonth.setHours(0, 0, 0, 0);

	const lowStockItemsRaw = await locals.db.items.findMany({
		where: { stock: { lte: 5 } },
		include: { categories: true },
		orderBy: { stock: 'asc' },
		take: 5
	});

	const recentRequestsRaw = await locals.db.inventory_requests.findMany({
		where: locals.user.role === 'admin' ? {} : { user_id: locals.user.id },
		include: {
			users: true,
			inventory_request_items: {
				include: {
					items: true
				}
			}
		},
		orderBy: { created_at: 'desc' },
		take: 5
	});

	const processedThisMonth = await locals.db.inventory_requests.count({
		where: {
			status: { in: ['processed', 'ready', 'completed'] },
			updated_at: { gte: currentMonth }
		}
	});

	const completedCount = await locals.db.inventory_requests.count({
		where: locals.user.role === 'admin' ? { status: 'completed' } : { user_id: locals.user.id, status: 'completed' }
	});

	const userPendingCount = await locals.db.inventory_requests.count({
		where: locals.user.role === 'admin' ? { status: 'pending' } : { user_id: locals.user.id, status: 'pending' }
	});

	const totalRequestsMonth = await locals.db.inventory_requests.count({
		where: locals.user.role === 'admin' ? { created_at: { gte: currentMonth } } : { user_id: locals.user.id, created_at: { gte: currentMonth } }
	});

	return json({
		totalItems,
		pendingRequests: pendingRequestsCount,
		completedDeliveryOrders,
		totalUsers,
		stats: {
			total_items: totalItems,
			pending_requests: pendingRequestsCount,
			processed_this_month: processedThisMonth,
			low_stock_count: lowStockItemsRaw.length,
			total_requests_month: totalRequestsMonth,
			pending_count: userPendingCount,
			completed_count: completedCount
		},
		recent_requests: recentRequestsRaw.map(serializeRequest),
		low_stock_items: lowStockItemsRaw.map(serializeItem)
	});
};
