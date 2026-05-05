<script lang="ts">
  import { Search, Truck, ArrowUpRight, Package, Calendar } from "@lucide/svelte";
  import Table from "$lib/components/Table.svelte";
  import { api } from "$lib/api";
  import { onMount } from "svelte";

  let deliveryOrders = $state<any[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");

  onMount(async () => {
    try {
      const data = await api.get('/delivery-orders');
      deliveryOrders = data.map((doItem: any) => ({
        id: doItem.do_number,
        dbId: doItem.id,
        driver_name: doItem.driver_name,
        license_plate: doItem.license_plate,
        request_number: doItem.inventory_request?.request_number ?? doItem.inventory_requests?.request_number ?? "—",
        user_name: doItem.inventory_request?.user?.name ?? doItem.inventory_requests?.user?.name ?? doItem.inventory_request?.users?.name ?? doItem.inventory_requests?.users?.name ?? "—",
        date: new Date(doItem.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        status: doItem.status,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  });

  let filteredDOs = $derived(
    deliveryOrders.filter(d =>
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.request_number.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(d => ({
      ...d,
      kurir_display: `${d.driver_name} (${d.license_plate})`,
      status_display: d.status === 'delivered' ? 'Selesai' : (d.status === 'in_transit' ? 'Dikirim' : 'Menunggu'),
    }))
  );

  // Note: custom table columns. We won't use the generic Table.svelte entirely if we need a custom action link, 
  // but Table.svelte supports `onEdit` which returns an event. For a link, it's better to build a custom table 
  // or use the generic one if we can intercept the edit action.
  // Actually, we'll just build a clean table here like in approvals for the custom ArrowUpRight link.
</script>

<svelte:head>
  <title>Surat Jalan | Khwarizmi Inventory</title>
</svelte:head>

<div class="space-y-5">
  <div class="page-header">
    <h1>Surat Jalan (Delivery Order)</h1>
    <p>Manajemen dan riwayat pengiriman barang keluar</p>
  </div>

  <div class="relative max-w-sm">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Search size={15} class="text-gray-400" />
    </div>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Cari DO, sopir, atau ID request..."
      class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15 transition-all"
    />
  </div>

  <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
    <table class="w-full text-[13px] text-left">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-50/50">
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Nomor DO</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500">ID Request</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500 hidden md:table-cell">Penerima</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500 hidden sm:table-cell">Kurir</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Tanggal</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#if isLoading}
          {#each Array(5) as _}
            <tr class="border-b border-gray-50 animate-pulse">
              {#each Array(6) as __}
                <td class="px-5 py-4"><div class="h-3.5 bg-gray-100 rounded-md w-4/5"></div></td>
              {/each}
            </tr>
          {/each}
        {:else if filteredDOs.length === 0}
          <tr>
            <td colspan="6" class="px-5 py-16 text-center text-sm text-gray-400">Tidak ada surat jalan ditemukan</td>
          </tr>
        {:else}
          {#each filteredDOs as doItem}
            <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
              <td class="px-5 py-4 font-semibold text-gray-900">
                <div class="flex items-center gap-2">
                  <Truck size={14} class="text-gray-400" />
                  {doItem.id}
                </div>
              </td>
              <td class="px-5 py-4 text-indigo-600 font-medium">{doItem.request_number}</td>
              <td class="px-5 py-4 hidden md:table-cell text-gray-600">{doItem.user_name}</td>
              <td class="px-5 py-4 hidden sm:table-cell">
                <p class="font-medium text-gray-800">{doItem.driver_name}</p>
                <p class="text-[11px] text-gray-400">{doItem.license_plate}</p>
              </td>
              <td class="px-5 py-4 text-gray-500">{doItem.date}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end">
                  <a
                    href={`/admin/delivery-orders/${doItem.dbId}`}
                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Detail & Cetak"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
