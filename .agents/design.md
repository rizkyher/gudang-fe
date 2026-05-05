# Gudang Frontend - Sistem Desain & UX (Design)

Aplikasi ini menggunakan pendekatan desain **Minimalis, Clean, dan Tipografi-Sentris**. Kami telah membuang elemen berat (gradien tebal, shadow berlebihan, sudut membulat ekstrim) demi antarmuka yang lebih profesional, padat informasi (data-dense), dan elegan.

## 1. Tipografi sebagai Fondasi (Typography-First)

*   Aplikasi menggunakan font **Inter** secara global.
*   **Hierarchy ketat:**
    *   Gunakan `font-semibold` atau `font-bold` untuk judul dan elemen penekanan. (Hindari `font-black` yang terlalu mencolok).
    *   Teks bantuan dan deskripsi meta menggunakan `text-[11px]` hingga `text-[13px]` dengan warna `text-gray-400` atau `text-gray-500`.
    *   Gunakan *tracking* yang tepat (misal `tracking-tight` untuk judul besar).

## 2. Palet Warna (Cool Grayscale & Indigo)

Desain sangat bergantung pada *whitespace* dan kontras abu-abu.
*   **Netral (Base):** Latar belakang aplikasi adalah `bg-gray-50` atau `bg-gray-100`. Kartu menggunakan `bg-white` dengan border halus `border-gray-100` atau `border-gray-200`.
*   **Aksen Utama:** Indigo (`text-indigo-600`, `bg-indigo-50`, ring focus `ring-indigo-400/15`). Digunakan hemat untuk menunjukkan elemen yang bisa berinteraksi atau status aktif.
*   **Aksi Kuat:** Hitam/Abu-abu sangat gelap (`bg-gray-900`) untuk tombol *Call to Action* primer (seperti tombol submit atau logo).
*   **Warna Semantik (Semantic):** Gunakan pastel + teks solid.
    *   Selesai / Aman: `bg-green-50 text-green-600`
    *   Menunggu / Proses: `bg-amber-50 text-amber-600`
    *   Ditolak / Bahaya / Hapus: `bg-red-50 text-red-600`

## 3. Komponen Inti (Primitive Tokens)

Komponen UI mendasar telah diabstraksi ke dalam file `src/routes/layout.css`. Saat membangun halaman baru, terapkan kelas-kelas ini:
*   `.card`: Kotak putih dasar dengan border tipis dan shadow sangat halus (`var(--shadow-xs)`).
*   `.badge`: Label status kecil, berpasangan dengan modifier seperti `.badge-indigo`, `.badge-green`, `.badge-gray`.
*   `.btn`: Dasar tombol interaktif. Modifiers: `.btn-primary` (Gelap), `.btn-ghost` (Transparan hover abu-abu), `.btn-danger`.
*   `.input-base`: Gaya form input standar dengan outline indigo halus saat `focus`.
*   `.page-header`: Pola standar judul halaman (kombinasi `<h1>` dan `<p>` deskripsi).

## 4. Gaya Visual & Interaksi Minimalis

*   **Sudut Membulat (Border Radius):** Moderat. Secara default menggunakan `--radius` (sekitar `0.75rem` / `rounded-xl` atau `rounded-2xl` untuk container utama).
*   **Batas (Borders):** Pemisah elemen lebih banyak mengandalkan *border* halus (`border-gray-100`) alih-alih bayangan kuat.
*   **Interaksi (Micro-interactions):**
    *   Hover: Perubahan warna background subtle (misal `hover:bg-gray-50`).
    *   Active: Efek `active:scale-[0.98]` pada tombol untuk *feedback* tekanan taktil.
    *   Loading: Gunakan *skeleton animation* (`animate-pulse`) yang halus dengan warna `bg-gray-100`, alih-alih menampilkan *spinner* raksasa di tengah layar.

Dengan mempertahankan kaidah "kurang itu lebih" (*less is more*), antarmuka aplikasi akan selalu terasa lapang, berkelas, dan mudah dibaca oleh pengguna.
