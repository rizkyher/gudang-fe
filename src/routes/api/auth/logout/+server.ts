import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('token', { path: '/', httpOnly: true, sameSite: 'strict', secure: !dev });
	return json({ message: 'Logged out successfully' });
};
