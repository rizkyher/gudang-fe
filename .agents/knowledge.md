# Gudang Frontend - Knowledge Base

Dokumen ini memuat fondasi teknis dan arsitektur terkini dari aplikasi **Gudang Frontend**, sebagai *source of truth* bagi agen AI dan *developer* yang bekerja pada *codebase* ini.

---

## ⚠️ Perubahan Arsitektur Mayor (Versi Terkini)

**Backend Laravel sudah TIDAK DIGUNAKAN.** Proyek `gudang-fe` adalah aplikasi **SvelteKit Fullstack** yang mandiri. Backend Laravel di direktori `web-gudang` adalah *legacy* dan tidak diaktifkan kecuali untuk keperluan migrasi data.

---

## Arsitektur Aplikasi

Aplikasi ini adalah **SvelteKit Fullstack** dengan dua portal:

1. **Portal Admin (`/admin`)**: Manajemen inventori terpadu — master data barang, persetujuan permintaan, surat jalan, laporan. Layout *dashboard* dengan Sidebar.
2. **Portal User (`/user`)**: *Mobile-first* bagi karyawan untuk meminta barang dan melihat riwayat. Bottom Navigation.

---

## Stack Teknologi

| Layer | Teknologi |
| :--- | :--- |
| Framework | SvelteKit v2 (Svelte 5) |
| Adapter | `@sveltejs/adapter-cloudflare` (Cloudflare Pages) |
| Database (Production) | Cloudflare D1 (SQLite-compatible, via `PrismaD1`) |
| Database (Development) | SQLite lokal (`dev.db`, via `PrismaLibSql`) |
| ORM | Prisma v7.8 |
| Validasi Input | Zod v4 |
| Auth | JWT (`HttpOnly cookie` via `jsonwebtoken`) + bcryptjs |
| Package Manager | **Bun** (wajib, lihat `bun.lock`) |
| Styling | Tailwind CSS v4 + Custom CSS di `layout.css` |
| Icons | `@lucide/svelte` |
| Deploy Target | Cloudflare Pages |

---

## Autentikasi (Server-Driven Session)

Arsitektur auth **sepenuhnya dikendalikan server**, bukan localStorage:

1. `POST /api/auth/login` → server memvalidasi kredensial → set `HttpOnly cookie` bernama `token`
2. `src/hooks.server.ts` → membaca cookie `token` di setiap request → memverifikasi JWT → mengisi `event.locals.user`
3. `src/routes/+layout.server.ts` → membaca `locals.user` → mengekspor sebagai `data.user` ke semua halaman
4. `src/routes/+layout.svelte` → menerima `data.user` → menyinkronkan `auth` store via `$effect.pre()`
5. Guard server-side ada di `src/routes/admin/+layout.server.ts` dan `src/routes/user/+layout.server.ts`

**Alur Login yang benar:**
```
api.post('/auth/login') → set cookie → await invalidateAll() → goto('/admin')
```

**JANGAN** mengandalkan `localStorage` atau `onMount` sebagai penjaga akses. Guard dilakukan di server.

---

## Prisma & Database

### Schema
- File: `prisma/schema.prisma` — provider: `sqlite` (kompatibel dengan D1)
- **Tidak ada tipe MySQL spesifik** (`@db.UnsignedBigInt`, `@db.VarChar` dll sudah dihapus)
- `enum` Prisma diganti dengan `String` biasa (karena SQLite tidak support native enum)
- Semua ID menggunakan `Int` (bukan `BigInt`)

### Koneksi Adaptif
```ts
// src/lib/server/prisma.ts
if (!dev && env?.DB) {
  // Production: Cloudflare D1 binding
  new PrismaClient({ adapter: new PrismaD1(env.DB) })
} else {
  // Development: SQLite file lokal
  new PrismaClient({ adapter: new PrismaLibSql({ url: 'file:./dev.db' }) })
}
```

### Perintah Prisma Penting
```bash
bunx prisma db push          # Sinkronkan schema ke dev.db (lokal)
bunx prisma db seed          # Isi data awal (admin, staff, kategori, barang)
bunx prisma generate         # Regenerate Prisma Client setelah ubah schema
bunx prisma studio           # GUI database lokal
```

### Data Seed (Default)
| Email | Password | Role |
| :--- | :--- | :--- |
| `admin@khwarizmi.ac.id` | `password123` | admin |
| `staff@khwarizmi.ac.id` | `password123` | user |

---

## API Endpoints (SvelteKit Server Routes)

Semua endpoint berada di `src/routes/api/`:

| Method | Path | Deskripsi | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | Login, set cookie | Publik |
| POST | `/api/auth/logout` | Hapus cookie | Login |
| GET | `/api/dashboard-summary` | Statistik dashboard | Login |
| GET/POST | `/api/categories` | Daftar & buat kategori | Login |
| GET/POST | `/api/items` | Daftar & buat barang | Login |
| PUT/DELETE | `/api/items/[id]` | Update & hapus barang | Admin |
| GET/POST | `/api/requests` | Permintaan inventori | Login |
| PUT | `/api/requests/[id]/status` | Update status request | Admin |
| GET/POST | `/api/delivery-orders` | Surat jalan | Login |
| GET | `/api/notifications` | Notifikasi user | Login |

---

## Validasi Input (Zod)

Semua schema validasi terpusat di `src/lib/server/schemas.ts`:
- `LoginSchema`, `CategorySchema`, `ItemSchema`, `ItemUpdateSchema`
- `RequestItemSchema`, `InventoryRequestSchema`, `RequestStatusSchema`
- `DeliveryOrderSchema`, `UserSchema`, `UpdatePasswordSchema`

**Pattern wajib untuk setiap endpoint:**
```ts
const parsed = SchemaName.safeParse(body);
if (!parsed.success) return json({ message: parsed.error.issues[0].message }, { status: 400 });
```

---

## Rute & Guard Akses

| Rute | Guard | Keterangan |
| :--- | :--- | :--- |
| `/login` | Publik | — |
| `/register` | Publik | — |
| `/admin/*` | `locals.user` + `role === 'admin'` | Redirect ke `/login` jika tidak ada sesi |
| `/user/*` | `locals.user` | Redirect ke `/login` jika tidak ada sesi |

Guard diimplementasikan di `+layout.server.ts` masing-masing direktori.

---

## Deployment ke Cloudflare

### Prasyarat
1. Buat database D1 di dashboard Cloudflare
2. Salin `database_id` ke `wrangler.toml`
3. Terapkan skema ke D1: `bunx wrangler d1 execute web-gudang-db --remote --file=<migration.sql>`
4. Set secret `JWT_SECRET` di Cloudflare Pages Environment Variables

### Deploy
```bash
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare
```

### wrangler.toml (template)
```toml
name = "gudang-fe"
compatibility_date = "2024-05-04"
pages_build_output_dir = ".svelte-kit/cloudflare"

[[d1_databases]]
binding = "DB"
database_name = "web-gudang-db"
database_id = "GANTI_DENGAN_ID_ASLI"
```

---

## Modul & Rute Aplikasi

| Rute | Modul | Akses |
| :--- | :--- | :--- |
| `/login` | Halaman login | Publik |
| `/register` | Pendaftaran pengguna | Publik |
| `/user` | Dashboard user | User |
| `/user/request` | Form permintaan barang | User |
| `/user/history` | Riwayat permintaan | User |
| `/user/notifications` | Notifikasi | User |
| `/user/profile` | Profil & ganti password | User |
| `/admin` | Dashboard admin | Admin |
| `/admin/items` | Master data barang | Admin |
| `/admin/categories` | Master kategori | Admin |
| `/admin/approvals` | Persetujuan permintaan | Admin |
| `/admin/delivery-orders` | Surat jalan | Admin |
| `/admin/reports` | Laporan stok & transaksi | Admin |
| `/admin/users` | Manajemen pengguna | Admin |
