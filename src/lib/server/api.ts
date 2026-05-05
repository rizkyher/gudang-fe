type RequestWithItems = {
	id: number;
	request_number: string;
	user_id: number;
	status: string;
	notes: string | null;
	admin_note: string | null;
	created_at: Date | null;
	updated_at: Date | null;
	users?: {
		id: number;
		name: string;
		email: string;
		role: string;
	} | null;
	inventory_request_items?: Array<{
		id: number;
		quantity: number;
		items?: {
			id: number;
			code: string;
			name: string;
			stock: number;
			unit: string;
		} | null;
	}>;
};

type DeliveryOrderWithRequest = {
	id: number;
	do_number: string;
	inventory_request_id: number;
	driver_name: string;
	license_plate: string;
	status: string;
	notes: string | null;
	created_at: Date | null;
	updated_at: Date | null;
	inventory_requests?: RequestWithItems | null;
};

export function serializeRequest(request: RequestWithItems | null) {
	if (!request) return null;

	return {
		...request,
		user: request.users ?? null,
		users: request.users ?? null,
		items:
			request.inventory_request_items?.map((entry) => ({
				id: entry.id,
				quantity: entry.quantity,
				item: entry.items ?? null,
				items: entry.items ?? null
			})) ?? [],
		inventory_request_items: request.inventory_request_items ?? []
	};
}

export function serializeDeliveryOrder(deliveryOrder: DeliveryOrderWithRequest | null) {
	if (!deliveryOrder) return null;

	const inventoryRequest = serializeRequest(deliveryOrder.inventory_requests ?? null);

	return {
		...deliveryOrder,
		inventory_request: inventoryRequest,
		inventory_requests: inventoryRequest
	};
}

export function serializeItem<
	T extends {
		categories?: {
			id: number;
			name: string;
			icon: string | null;
			created_at: Date | null;
			updated_at: Date | null;
		} | null;
	}
>(item: T) {
	return {
		...item,
		category: item.categories ?? null,
		categories: item.categories ?? null
	};
}
