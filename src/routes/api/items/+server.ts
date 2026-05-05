import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ItemSchema } from '$lib/server/schemas';
import { serializeItem } from '$lib/server/api';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const nameFilter = url.searchParams.get('filter[name]');
	
	const items = await locals.db.items.findMany({
		where: nameFilter ? {
			name: { contains: nameFilter }
		} : {},
		include: { categories: true }
	});
	
	return json(items.map(serializeItem));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') return json({ message: 'Unauthorized' }, { status: 403 });

	const data = await request.json();
	const parsed = ItemSchema.safeParse(data);
	
	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	const itemData = parsed.data;

	const item = await locals.db.items.create({
		data: {
			code: itemData.code,
			name: itemData.name,
			category_id: itemData.category_id,
			stock: itemData.stock,
			unit: itemData.unit,
			icon: itemData.icon || null,
			description: itemData.description || null,
			created_at: new Date(),
			updated_at: new Date()
		},
		include: { categories: true }
	});

	return json(serializeItem(item), { status: 201 });
};
