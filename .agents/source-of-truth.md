# Gudang Frontend - Source of Truth Arsitektur

Dokumen ini adalah **sumber kebenaran tunggal** (*single source of truth*) untuk seluruh keputusan teknis dan arsitektur yang sudah dibuat dan berlaku di proyek `gudang-fe`.

---

## Status Proyek

| Aspek | Status |
| :--- | :--- |
| Backend Laravel | ❌ Legacy, tidak digunakan |
| SvelteKit Fullstack | ✅ Aktif, sumber tunggal business logic |
| Database Lokal | ✅ SQLite (`dev.db`) via PrismaLibSql |
| Database Production | 🔧 Cloudflare D1 (perlu `database_id` nyata di `wrangler.toml`) |
| Auth | ✅ HttpOnly Cookie JWT |
| Deployment | 🔧 Cloudflare Pages (siap, perlu akun CF) |

---

## Keputusan Teknis yang Sudah Final

### 1. Database: MySQL → SQLite / D1
Semua referensi MySQL spesifik (`@db.UnsignedBigInt`, `@db.VarChar`, native enum) telah dihapus dari `schema.prisma`. Tipe data menggunakan tipe Prisma universal yang kompatibel dengan SQLite.

### 2. Auth: Token-in-Cookie (HttpOnly)
- Cookie `token` (JWT) di-set saat login dan dibaca server di setiap request
- `locals.user` menjadi sumber data user di semua server route
- Tidak menggunakan Sanctum, tidak mengandalkan `Authorization: Bearer` sebagai jalur utama (hanya fallback)

### 3. Prisma: Request-Scoped via locals.db
- `getPrisma(env?)` dipanggil sekali di `hooks.server.ts` dan disimpan di `locals.db`
- Adaptive: pakai D1 di production, pakai LibSQL di development
- Tidak ada singleton global Prisma yang diimpor langsung dari halaman/komponen

### 4. Validasi: Zod Terpusat
- Satu file `src/lib/server/schemas.ts` untuk semua schema
- Semua endpoint POST/PUT wajib validasi sebelum menyentuh database

### 5. Frontend Auth Flow
- `+layout.server.ts` (root) → kirim `data.user` ke semua halaman
- `+layout.svelte` (root) → sinkronkan ke `auth` store via `$effect.pre()`
- Guard per-area di `admin/+layout.server.ts` dan `user/+layout.server.ts`

---

## Struktur Direktori Kunci

```
gudang-fe/
├── .agents/              ← Dokumentasi agen (knowledge, rules, design, sot)
├── prisma/
│   ├── schema.prisma     ← Schema SQLite/D1
│   └── seed.ts           ← Data awal (admin, staff, barang)
├── prisma.config.ts      ← Konfigurasi Prisma + seed command
├── src/
│   ├── app.d.ts          ← Definisi Locals (user, db) dan Platform (env.DB)
│   ├── hooks.server.ts   ← Auth middleware: baca cookie → isi locals.user + locals.db
│   ├── lib/
│   │   ├── api.ts        ← HTTP client wrapper (klien)
│   │   ├── stores/auth.svelte.ts  ← Global auth state (Svelte 5 runes)
│   │   └── server/
│   │       ├── prisma.ts ← getPrisma() adaptive (D1 / LibSQL)
│   │       ├── jwt.ts    ← signToken(), verifyToken()
│   │       └── schemas.ts← Semua Zod schema
│   └── routes/
│       ├── +layout.server.ts   ← Kirim locals.user ke semua halaman
│       ├── +layout.svelte      ← Sinkronkan auth store dari data server
│       ├── api/                ← Semua server routes (backend)
│       ├── admin/
│       │   └── +layout.server.ts  ← Guard: wajib admin
│       └── user/
│           └── +layout.server.ts  ← Guard: wajib login
├── wrangler.toml         ← Konfigurasi Cloudflare Pages + D1 binding
└── dev.db                ← Database SQLite lokal (sudah ter-seed)
```

---

## Variabel Lingkungan (.env)

```env
DATABASE_URL="file:./dev.db"   # Hanya untuk prisma.config.ts (migrate lokal)
JWT_SECRET="..."               # Wajib ada. Di production: Cloudflare Secret
```

---

## Perintah Workflow Harian

```bash
# Jalankan development
bun dev

# Setelah ubah schema.prisma
bunx prisma generate
bunx prisma db push

# Reset data lokal
bunx prisma db seed

# Periksa TypeScript errors
bun run check

# Build untuk Cloudflare Pages
bun run build

# Deploy ke Cloudflare Pages
bunx wrangler pages deploy .svelte-kit/cloudflare
```

---

## Bug & Gotcha yang Sudah Diketahui

| Masalah | Solusi |
| :--- | :--- |
| Port `5173` sudah terpakai saat `bun dev` | Matikan proses lama atau buka port yang tertera di terminal |
| `bun dev` adapter-cloudflare menyimulasikan D1 kosong | `prisma.ts` sudah fix: selalu pakai `dev.db` saat `dev === true` |
| Prisma Client cache stale setelah ganti provider | Hapus `node_modules/.vite` dan restart `bun dev` |
| Cookie tidak dibaca antar port berbeda | Buka URL dengan port yang sama dimana cookie di-set |
| `$effect.pre` tidak jalan di SSR | Normal. Sinkronisasi auth store hanya di klien |
