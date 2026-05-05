import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { UserSchema } from '$lib/server/schemas';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const id = Number(params.id);
	const body = await request.json();
	const parsed = UserSchema.safeParse(body);

	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	const existingUser = await locals.db.users.findFirst({
		where: {
			email: parsed.data.email,
			NOT: { id }
		}
	});

	if (existingUser) {
		return json({ message: 'Email sudah digunakan' }, { status: 400 });
	}

	const updateData: Record<string, unknown> = {
		name: parsed.data.name,
		email: parsed.data.email,
		role: parsed.data.role,
		updated_at: new Date()
	};

	if (parsed.data.password) {
		updateData.password = await bcrypt.hash(parsed.data.password, 10);
	}

	const user = await locals.db.users.update({
		where: { id },
		data: updateData,
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			phone: true,
			created_at: true,
			updated_at: true
		}
	});

	return json(user);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const id = Number(params.id);
	if (id === locals.user.id) {
		return json({ message: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
	}

	await locals.db.users.delete({ where: { id } });
	return json({ message: 'User deleted' });
};
