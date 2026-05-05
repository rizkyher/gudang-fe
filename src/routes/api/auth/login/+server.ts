import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import bcrypt from 'bcryptjs';
import { signToken } from '$lib/server/jwt';
import { LoginSchema } from '$lib/server/schemas';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const body = await request.json();
	const parsed = LoginSchema.safeParse(body);

	if (!parsed.success) {
		return json({ message: parsed.error.issues[0].message }, { status: 400 });
	}

	const { email, password } = parsed.data;

	const user = await locals.db.users.findUnique({
		where: { email }
	});

	if (!user) {
		return json({ message: 'Invalid credentials' }, { status: 401 });
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		return json({ message: 'Invalid credentials' }, { status: 401 });
	}

	const token = signToken({ id: Number(user.id), role: user.role });

	cookies.set('token', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: 60 * 60 * 24
	});

	return json({
		user: {
			id: Number(user.id),
			name: user.name,
			email: user.email,
			role: user.role
		},
		token
	});
};
