import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CategorySchema } from '$lib/server/schemas';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });
	
	const categories = await locals.db.categories.findMany();
	return json(categories);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') return json({ message: 'Unauthorized' }, { status: 403 });

	const data = await request.json();
	const parsed = CategorySchema.safeParse(data);
	if (!parsed.success) return json({ message: parsed.error.issues[0].message }, { status: 400 });

	const category = await locals.db.categories.create({
		data: {
			name: parsed.data.name,
			icon: parsed.data.icon || null,
			created_at: new Date(),
			updated_at: new Date()
		}
	});
	return json(category, { status: 201 });
};
