<script lang="ts">
  import { Clock, CheckCircle, XCircle, Package, ClipboardList } from "@lucide/svelte";
  import { api } from "$lib/api";
  import { onMount } from "svelte";

  let activeTab = $state("Semua");
  const tabs = ["Semua", "Diproses", "Selesai", "Ditolak"];

  let historyData = $state<any[]>([]);
  let isLoading = $state(true);

  onMount(async () => {
    try {
      const data = await api.get('/requests');
      historyData = data.map((r: any) => ({
        id:     r.request_number,
        date:   new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: r.status === 'completed' ? 'Selesai' : r.status === 'rejected' ? 'Ditolak' : 'Diproses',
        note:   r.admin_note,
        items:  (r.items ?? []).map((i: any) => ({ name: i.item?.name ?? i.items?.name ?? "—", qty: i.quantity })),
      }));
    } catch (e) { console.error(e); }
    finally { isLoading = false; }
  });

  let filtered = $derived(
    activeTab === "Semua" ? historyData : historyData.filter(h => h.status === activeTab)
  );

  function statusInfo(s: string) {
    if (s === "Diproses") return { cls: "badge-amber", icon: Clock };
    if (s === "Selesai")  return { cls: "badge-green", icon: CheckCircle };
    if (s === "Ditolak")  return { cls: "badge-red",   icon: XCircle };
    return { cls: "badge-gray", icon: Clock };
  }
</script>

<svelte:head>
  <title>Riwayat | Khwarizmi Inventory</title>
</svelte:head>

<!-- Header -->
<div class="px-5 pt-10 pb-4 bg-white border-b border-gray-100 sticky top-0 z-20">
  <h1 class="text-[20px] font-bold text-gray-900 mb-4">Riwayat</h1>

  <!-- Tabs -->
  <div class="flex gap-2 overflow-x-auto scrollbar-none pb-1">
    {#each tabs as tab}
      <button
        onclick={() => (activeTab = tab)}
        class="px-4 py-1.5 rounded-xl text-[12px] font-semibold shrink-0 transition-all border
          {activeTab === tab
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}"
      >
        {tab}
      </button>
    {/each}
  </div>
</div>

<!-- List -->
<div class="px-5 py-4 space-y-3">
  {#if isLoading}
    {#each Array(4) as _}
      <div class="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-gray-100 rounded-xl"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-gray-100 rounded w-2/5"></div>
            <div class="h-2.5 bg-gray-100 rounded w-1/4"></div>
          </div>
        </div>
        <div class="h-px bg-gray-50"></div>
        <div class="flex gap-2">
          <div class="h-6 bg-gray-100 rounded-lg w-24"></div>
          <div class="h-6 bg-gray-100 rounded-lg w-16"></div>
        </div>
      </div>
    {/each}
  {:else if filtered.length === 0}
    <div class="py-16 text-center">
      <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <ClipboardList size={20} class="text-gray-400" />
      </div>
      <p class="text-sm font-semibold text-gray-700">Belum ada riwayat</p>
      <p class="text-xs text-gray-400 mt-1">Tidak ada permintaan dengan status "{activeTab}"</p>
    </div>
  {:else}
    {#each filtered as item (item.id)}
      {@const st = statusInfo(item.status)}
      <div class="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 hover:border-gray-200 transition-colors">
        <!-- Top row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <st.icon size={15} class="text-gray-500" />
            </div>
            <div>
              <p class="text-[13px] font-semibold text-gray-900">{item.id}</p>
              <p class="text-[11px] text-gray-400">{item.date}</p>
            </div>
          </div>
          <span class="badge {st.cls}">{item.status}</span>
        </div>

        <!-- Items -->
        <div class="border-t border-gray-50 pt-3">
          <div class="flex flex-wrap gap-1.5">
            {#each item.items as barang}
              <span class="text-[11px] px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg font-medium text-gray-700">
                <span class="font-bold text-gray-900">{barang.qty}×</span> {barang.name}
              </span>
            {/each}
          </div>

          {#if item.note}
            <p class="text-[11px] text-gray-500 mt-2 pl-2 border-l-2 border-gray-200">{item.note}</p>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>
