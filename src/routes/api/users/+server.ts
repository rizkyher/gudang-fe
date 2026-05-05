import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { UserSchema } from '$lib/server/schemas';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const users = await locals.db.users.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			phone: true,
			created_at: true,
			updated_at: true
		},
		orderBy: { created_at: 'desc' }
	});

	return json(users);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const body = await request.json();
	const parsed = UserSchema.safeParse(body);

	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	if (!parsed.data.password) {
		return json({ message: 'Password wajib diisi' }, { status: 400 });
	}

	const existingUser = await locals.db.users.findUnique({
		where: { email: parsed.data.email }
	});

	if (existingUser) {
		return json({ message: 'Email sudah digunakan' }, { status: 400 });
	}

	const password = await bcrypt.hash(parsed.data.password, 10);
	const user = await locals.db.users.create({
		data: {
			name: parsed.data.name,
			email: parsed.data.email,
			password,
			role: parsed.data.role,
			created_at: new Date(),
			updated_at: new Date()
		},
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

	return json(user, { status: 201 });
};
