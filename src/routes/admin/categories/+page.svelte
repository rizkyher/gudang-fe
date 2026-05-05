<script lang="ts">
  import { Plus, Tags, MapPin, Edit2, Trash2 } from "@lucide/svelte";

  let categories = $state([
    { id: 1, name: "Alat Tulis Kantor", code: "ATK", items_count: 45 },
    { id: 2, name: "Elektronik & Jaringan", code: "ELK", items_count: 12 },
    { id: 3, name: "Bahan Kebersihan", code: "CLN", items_count: 8 },
  ]);

  let locations = $state([
    { id: 1, name: "Rak A1", description: "Rak Besi Kanan, Baris 1" },
    { id: 2, name: "Lemari B", description: "Lemari Kaca Kiri" },
  ]);
</script>

<svelte:head>
  <title>Kategori & Rak · Khwarizmi</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-black text-slate-900 tracking-tight">
      Kategori & Lokasi Rak
    </h1>
    <p class="text-sm text-slate-500 mt-1">
      Kelola pengelompokan barang dan titik penyimpanan di gudang.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Kategori Card -->
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"
          >
            <Tags size={16} />
          </div>
          <h2 class="font-black text-slate-900 text-[15px]">Kategori Barang</h2>
          <span
            class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-black rounded-full"
          >
            {categories.length}
          </span>
        </div>
        <button
          class="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      <div class="flex-1">
        {#if categories.length === 0}
          <div
            class="flex flex-col items-center justify-center py-12 text-slate-400"
          >
            <Tags size={24} class="mb-2" />
            <p class="text-sm font-medium">Belum ada kategori</p>
          </div>
        {:else}
          <ul class="divide-y divide-slate-50">
            {#each categories as cat}
              <li
                class="flex items-center justify-between px-5 py-4 group hover:bg-slate-50/60 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center text-xs font-black tracking-tight"
                  >
                    {cat.code}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900">{cat.name}</p>
                    <p class="text-xs text-slate-400 mt-0.5">
                      {cat.items_count} barang terdaftar
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>

    <!-- Lokasi Card -->
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"
          >
            <MapPin size={16} />
          </div>
          <h2 class="font-black text-slate-900 text-[15px]">Lokasi / Rak</h2>
          <span
            class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full"
          >
            {locations.length}
          </span>
        </div>
        <button
          class="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      <div class="flex-1">
        {#if locations.length === 0}
          <div
            class="flex flex-col items-center justify-center py-12 text-slate-400"
          >
            <MapPin size={24} class="mb-2" />
            <p class="text-sm font-medium">Belum ada lokasi</p>
          </div>
        {:else}
          <ul class="divide-y divide-slate-50">
            {#each locations as loc}
              <li
                class="flex items-center justify-between px-5 py-4 group hover:bg-slate-50/60 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"
                  >
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900">{loc.name}</p>
                    <p class="text-xs text-slate-400 mt-0.5">
                      {loc.description}
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
</div>
