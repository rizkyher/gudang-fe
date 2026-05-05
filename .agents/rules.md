# Gudang Frontend - Aturan Pengembangan (Rules)

Dokumen ini berisi standar kode yang **WAJIB** diikuti saat memodifikasi *codebase* ini.

---

## 1. Arsitektur: Fullstack SvelteKit (BUKAN Laravel)

- ❌ **JANGAN** membuat endpoint di Laravel atau memanggil `localhost:8000`
- ✅ **Semua logic backend** ada di `src/routes/api/*/+server.ts`
- ✅ **Semua akses database** menggunakan Prisma via `locals.db` (bukan import langsung dari `prisma.ts`)
- `locals.db` disuntikkan di `src/hooks.server.ts` untuk setiap request

---

## 2. Autentikasi: Server-Session (BUKAN Client-Only)

- ❌ **JANGAN** mengandalkan `localStorage` atau `auth.isAuthenticated` sebagai *gate* utama halaman
- ✅ **Guard akses halaman** harus dilakukan via `+layout.server.ts` yang mengecek `locals.user`
- ✅ Setelah login berhasil, gunakan `await invalidateAll()` untuk memicu reload server data, baru `goto()`
- Cookie `token` adalah *source of truth* sesi. `localStorage` hanya *fallback* untuk header Bearer

**Pattern login yang benar:**
```ts
const res = await api.post('/auth/login', { email, password });
localStorage.setItem("auth_token", res.token);
await invalidateAll(); // ← WAJIB sebelum redirect
goto(res.user.role === 'admin' ? '/admin' : '/user');
```

**Pattern guard halaman yang benar (di +layout.server.ts):**
```ts
import { redirect } from '@sveltejs/kit';
export const load = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/login');
  return { user: locals.user };
};
```

---

## 3. Database & Prisma

- ❌ **JANGAN** import `{ prisma }` langsung dari `$lib/server/prisma`
- ✅ Gunakan `locals.db` yang tersedia di setiap `+server.ts` dan `+page.server.ts`
- ✅ Semua ID di database adalah **`Int`** (bukan `BigInt`) — tidak perlu `BigInt()` casting
- ✅ Saat mengubah `schema.prisma`, selalu jalankan `bunx prisma generate` lalu `bunx prisma db push`

---

## 4. Validasi Input API

- ✅ Setiap endpoint POST/PUT **WAJIB** memvalidasi body menggunakan Zod schema dari `$lib/server/schemas.ts`
- ✅ Buat schema baru di `schemas.ts` jika belum tersedia, jangan inline di endpoint

**Pattern validasi yang benar:**
```ts
const parsed = SomeSchema.safeParse(await request.json());
if (!parsed.success) return json({ message: parsed.error.issues[0].message }, { status: 400 });
```

---

## 5. Svelte 5 Runes (Wajib)

- ❌ **DILARANG** menggunakan sintaks Svelte 4 (`export let`, `$:`, `on:click`, `slot`)
- ✅ Props: `let { prop } = $props();`
- ✅ State: `let x = $state(nilai)`
- ✅ Derived: `let y = $derived(ekspresi)`
- ✅ Events: `onclick={handler}` bukan `on:click`
- ✅ Slots diganti dengan `{#snippet name()}` dan `{@render name()}`
- ✅ `$effect.pre()` untuk sinkronisasi state sebelum render (hindari `onMount` untuk inisialisasi auth)

---

## 6. Tooling & Package Manager

- ✅ Gunakan **Bun** secara eksklusif: `bun add`, `bun dev`, `bun run check`
- ❌ **DILARANG** `npm`, `yarn`, atau `pnpm`
- `bun dev` menjalankan SvelteKit dev server. Defaultnya port 5173 (bisa berubah jika port terpakai)

---

## 7. CSS & Styling

- Proyek menggunakan **Tailwind CSS v4** + Custom CSS di `src/routes/layout.css`
- Gunakan kelas abstraksi: `.btn`, `.btn-primary`, `.card`, `.badge`, `.input-base`, `.page-header`
- Icons: gunakan `@lucide/svelte` secara eksklusif
- Jangan tulis `<style>` inline untuk styling standar; pakai Tailwind utility

---

## 8. Struktur File

- Komponen *reusable*: `src/lib/components/` (PascalCase)
- Utility / store: `src/lib/` (camelCase, contoh: `api.ts`, `auth.svelte.ts`)
- Server-only logic: `src/lib/server/` (tidak diakses dari sisi klien)
- API routes: `src/routes/api/[modul]/+server.ts`
- Page guards: `src/routes/[area]/+layout.server.ts`

---

## 9. Error Handling API

- Seluruh pemanggilan dari klien wajib melalui wrapper di `src/lib/api.ts`
- Wrapper menangani `401` (auto logout), parsing error JSON, dan header otomatis
- Selalu gunakan `try/catch` di komponen dan tampilkan state loading yang jelas

---

## 10. Cloudflare Deployment (Khusus)

- `adapter-cloudflare` memerlukan semua file server berjalan sebagai *Edge Worker* (tidak bisa gunakan Node-specific API)
- Di production, database diakses via `PrismaD1` menggunakan `env.DB` dari Cloudflare binding
- Di development, fallback ke `PrismaLibSql` dengan `file:./dev.db`
- Jangan pernah hardcode `DATABASE_URL` di kode; gunakan `.env` untuk lokal
