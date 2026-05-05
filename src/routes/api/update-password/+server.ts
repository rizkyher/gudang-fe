import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { UpdatePasswordSchema } from '$lib/server/schemas';

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ message: 'Unauthorized' }, { status: 401 });

	const body = await request.json();
	const parsed = UpdatePasswordSchema.safeParse(body);

	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	const user = await locals.db.users.findUnique({
		where: { id: locals.user.id }
	});

	if (!user) return json({ message: 'User not found' }, { status: 404 });

	const isMatch = await bcrypt.compare(parsed.data.current_password, user.password);
	if (!isMatch) {
		return json({ message: 'Password saat ini tidak sesuai' }, { status: 400 });
	}

	const password = await bcrypt.hash(parsed.data.new_password, 10);
	await locals.db.users.update({
		where: { id: user.id },
		data: {
			password,
			updated_at: new Date()
		}
	});

	return json({ message: 'Password updated successfully' });
};
