import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ItemUpdateSchema } from '$lib/server/schemas';
import { serializeItem } from '$lib/server/api';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') return json({ message: 'Unauthorized' }, { status: 403 });

	const id = Number(params.id!);
	const data = await request.json();
	const parsed = ItemUpdateSchema.safeParse(data);

	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	const itemData = parsed.data;

	const updateData: any = {};
	if (itemData.code) updateData.code = itemData.code;
	if (itemData.name) updateData.name = itemData.name;
	if (itemData.category_id) updateData.category_id = itemData.category_id;
	if (itemData.stock !== undefined) updateData.stock = itemData.stock;
	if (itemData.unit) updateData.unit = itemData.unit;
	if (itemData.icon !== undefined) updateData.icon = itemData.icon;
	if (itemData.description !== undefined) updateData.description = itemData.description;
	updateData.updated_at = new Date();

	const item = await locals.db.items.update({
		where: { id },
		data: updateData,
		include: { categories: true }
	});

	return json(serializeItem(item));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') return json({ message: 'Unauthorized' }, { status: 403 });

	const id = Number(params.id!);
	await locals.db.items.delete({ where: { id } });

	return json({ message: 'Item deleted' }, { status: 204 });
};
