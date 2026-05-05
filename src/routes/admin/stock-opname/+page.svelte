<script lang="ts">
  import {
    ScanLine,
    Save,
    FileSpreadsheet,
    AlertTriangle,
    CheckCircle2,
  } from "@lucide/svelte";

  let opnameDate = $state("2026-04-25");
  let items = $state([
    {
      id: "BRG-001",
      name: "Kertas A4 Sinar Dunia",
      system_stock: 50,
      actual_stock: 50,
      notes: "",
    },
    {
      id: "BRG-003",
      name: "Router Mikrotik RB750",
      system_stock: 2,
      actual_stock: 1,
      notes: "1 unit rusak fisik",
    },
    {
      id: "BRG-012",
      name: "Switch Hub 8 Port",
      system_stock: 1,
      actual_stock: 1,
      notes: "",
    },
  ]);

  let totalDiff = $derived(
    items.filter((i) => i.actual_stock !== i.system_stock).length,
  );
  let isSaving = $state(false);

  function handleSave() {
    isSaving = true;
    setTimeout(() => {
      isSaving = false;
    }, 1200);
  }
</script>

<svelte:head>
  <title>Stock Opname · Khwarizmi</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
  >
    <div>
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">
        Stock Opname
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Audit fisik stok dan catat penyesuaian dengan data sistem.
      </p>
    </div>
    <button
      class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
    >
      <FileSpreadsheet size={16} class="text-emerald-600" />
      Export Template Excel
    </button>
  </div>

  <!-- Alert if discrepancies -->
  {#if totalDiff > 0}
    <div
      class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
    >
      <AlertTriangle size={18} class="text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p class="text-sm font-bold text-amber-800">
          {totalDiff} item memiliki selisih stok
        </p>
        <p class="text-xs text-amber-700 mt-0.5">
          Pastikan catatan keterangan diisi sebelum menyimpan hasil opname.
        </p>
      </div>
    </div>
  {:else if !isSaving}
    <div
      class="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
    >
      <CheckCircle2 size={18} class="text-emerald-600 shrink-0" />
      <p class="text-sm font-bold text-emerald-800">
        Semua stok sesuai dengan data sistem.
      </p>
    </div>
  {/if}

  <!-- Main Card -->
  <div
    class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
  >
    <!-- Card Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/60"
    >
      <div class="flex items-center gap-2.5">
        <ScanLine size={18} class="text-slate-500" />
        <h2 class="font-black text-slate-900 text-[15px]">Data Pemeriksaan</h2>
      </div>
      <div class="flex items-center gap-2.5">
        <label
          for="opname-date"
          class="text-sm font-semibold text-slate-500 shrink-0"
          >Tanggal Opname:</label
        >
        <input
          type="date"
          id="opname-date"
          bind:value={opnameDate}
          class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr class="border-b border-slate-100">
            <th
              class="px-6 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32"
              >Kode</th
            >
            <th
              class="px-6 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-widest"
              >Nama Barang</th
            >
            <th
              class="px-6 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-36"
              >Stok Sistem</th
            >
            <th
              class="px-6 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-36"
              >Stok Fisik</th
            >
            <th
              class="px-6 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-36 text-center"
              >Selisih</th
            >
            <th
              class="px-6 py-3.5 text-[11px] font-black text-slate-400 uppercase tracking-widest"
              >Keterangan</th
            >
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          {#each items as item}
            {@const diff = item.actual_stock - item.system_stock}
            {@const hasDiff = diff !== 0}
            <tr
              class="group {hasDiff
                ? 'bg-amber-50/40 hover:bg-amber-50/70'
                : 'hover:bg-slate-50/60'} transition-colors"
            >
              <td class="px-6 py-4">
                <span
                  class="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg"
                  >{item.id}</span
                >
              </td>
              <td class="px-6 py-4 font-semibold text-slate-800">{item.name}</td
              >
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-black rounded-xl"
                >
                  {item.system_stock}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <input
                  type="number"
                  bind:value={item.actual_stock}
                  min="0"
                  class="w-20 px-2 py-1.5 text-center text-sm font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    {hasDiff
                    ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-400'
                    : 'bg-white border-slate-200 text-slate-800'}"
                />
              </td>
              <td class="px-6 py-4 text-center">
                {#if diff > 0}
                  <span
                    class="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg"
                    >+{diff}</span
                  >
                {:else if diff < 0}
                  <span
                    class="inline-block px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-lg"
                    >{diff}</span
                  >
                {:else}
                  <span
                    class="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg"
                    >—</span
                  >
                {/if}
              </td>
              <td class="px-6 py-4">
                <input
                  type="text"
                  bind:value={item.notes}
                  placeholder={hasDiff
                    ? "Wajib diisi jika ada selisih…"
                    : "Catatan opsional…"}
                  class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow
                    {hasDiff && !item.notes
                    ? 'border-amber-300 bg-amber-50'
                    : ''}"
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div
      class="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60"
    >
      <p class="text-xs text-slate-400 font-medium">
        {items.length} barang diperiksa · {totalDiff} memiliki selisih
      </p>
      <button
        onclick={handleSave}
        disabled={isSaving}
        class="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.97] disabled:opacity-60"
      >
        {#if isSaving}
          <div
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></div>
          Menyimpan…
        {:else}
          <Save size={16} /> Simpan Hasil Opname
        {/if}
      </button>
    </div>
  </div>
</div>
