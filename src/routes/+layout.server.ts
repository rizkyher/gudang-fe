import type { LayoutServerLoad } from './$types';

// Baca locals.user yang sudah di-set oleh hooks.server.ts dari cookie JWT
// dan kirimkan sebagai data ke semua halaman (layout anak + page)
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user ?? null
	};
};
