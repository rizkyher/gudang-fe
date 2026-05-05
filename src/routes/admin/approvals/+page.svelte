<script lang="ts">
  import { Search, CheckCircle, XCircle, Clock, ArrowUpRight } from "@lucide/svelte";
  import { api } from "$lib/api";
  import { onMount } from "svelte";

  let requests    = $state<any[]>([]);
  let isLoading   = $state(true);
  let searchQuery = $state("");
  let selectedStatus = $state("all");

  onMount(() => { fetchRequests(); });

  async function fetchRequests() {
    isLoading = true;
    try {
      const data = await api.get('/requests');
      requests = data.map((r: any) => ({
        id: r.request_number,
        dbId: r.id,
        user: r.user?.name ?? r.users?.name ?? "—",
        role: (r.user?.role ?? r.users?.role) === "admin" ? "Admin" : "Staff",
        items: r.items?.map((i: any) => `${i.item?.name ?? i.items?.name} ×${i.quantity}`).join(", ") ?? "—",
        rawItems: r.items,
        date: new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        status: r.status,
        notes: r.notes ?? "—",
      }));
    } catch (e) { console.error(e); }
    finally { isLoading = false; }
  }

  async function updateStatus(dbId: number, status: string) {
    try {
      await api.put(`/requests/${dbId}/status`, { status, admin_note: "Ditinjau admin" });
      await fetchRequests();
    } catch (e: any) { alert(e.message || "Gagal memperbarui status."); }
  }

  const statuses = [
    { value: "all",       label: "Semua"    },
    { value: "pending",   label: "Menunggu" },
    { value: "processed", label: "Diproses" },
    { value: "rejected",  label: "Ditolak"  },
  ];

  let filtered = $derived(
    requests
      .filter(r => selectedStatus === "all" || r.status === selectedStatus)
      .filter(r =>
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  function statusCls(s: string) {
    if (s === "pending")   return "badge-amber";
    if (s === "rejected")  return "badge-red";
    if (s === "processed") return "badge-indigo";
    return "badge-green";
  }
  function statusLabel(s: string) {
    if (s === "pending")   return "Menunggu";
    if (s === "rejected")  return "Ditolak";
    if (s === "processed") return "Diproses";
    return "Selesai";
  }
</script>

<svelte:head>
  <title>Persetujuan | Khwarizmi Inventory</title>
</svelte:head>

<div class="space-y-5">
  <div class="page-header">
    <h1>Persetujuan Permintaan</h1>
    <p>Tinjau dan proses permintaan barang dari pengguna</p>
  </div>

  <!-- Filters -->
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1 max-w-sm">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search size={15} class="text-gray-400" />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari ID atau nama user..."
        class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15 transition-all"
      />
    </div>

    <div class="flex gap-2 flex-wrap">
      {#each statuses as s}
        <button
          onclick={() => (selectedStatus = s.value)}
          class="px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all border
            {selectedStatus === s.value
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'}"
        >
          {s.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Table -->
  <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
    <table class="w-full text-[13px] text-left">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-50/50">
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500">ID Request</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Pemohon</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500 hidden md:table-cell">Barang</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500 hidden sm:table-cell">Tanggal</th>
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Status</th>
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
        {:else if filtered.length === 0}
          <tr>
            <td colspan="6" class="px-5 py-16 text-center text-sm text-gray-400">Tidak ada permintaan ditemukan</td>
          </tr>
        {:else}
          {#each filtered as req}
            <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
              <td class="px-5 py-4 font-semibold text-indigo-600">{req.id}</td>
              <td class="px-5 py-4">
                <p class="font-medium text-gray-900">{req.user}</p>
                <p class="text-[11px] text-gray-400">{req.role}</p>
              </td>
              <td class="px-5 py-4 hidden md:table-cell">
                <p class="text-gray-600 truncate max-w-[200px]" title={req.items}>{req.items}</p>
              </td>
              <td class="px-5 py-4 text-gray-500 hidden sm:table-cell">{req.date}</td>
              <td class="px-5 py-4">
                <span class="badge {statusCls(req.status)}">{statusLabel(req.status)}</span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  {#if req.status === "pending"}
                    <button
                      onclick={() => updateStatus(req.dbId, "processed")}
                      class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Setujui"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onclick={() => updateStatus(req.dbId, "rejected")}
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Tolak"
                    >
                      <XCircle size={16} />
                    </button>
                  {/if}
                  <a
                    href={`/admin/approvals/${req.dbId}`}
                    class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Detail"
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
