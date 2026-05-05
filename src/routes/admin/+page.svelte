<script lang="ts">
  import { Package, AlertTriangle, Clock, CheckCircle, TrendingUp, ArrowUpRight, Plus } from "@lucide/svelte";
  import { api } from "$lib/api";
  import { auth } from "$lib/stores/auth.svelte";
  import { onMount } from "svelte";

  let dashboardData = $state<any>(null);
  let isLoading = $state(true);

  onMount(async () => {
    try {
      dashboardData = await api.get('/dashboard-summary');
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  });

  let stats = $derived([
    { label: "Total Barang",     value: dashboardData?.stats.total_items       ?? 0, icon: Package,       trend: null },
    { label: "Menunggu",         value: dashboardData?.stats.pending_requests   ?? 0, icon: Clock,         trend: null },
    { label: "Diproses Bulan Ini", value: dashboardData?.stats.processed_this_month ?? 0, icon: CheckCircle, trend: null },
    { label: "Stok Kritis",     value: dashboardData?.stats.low_stock_count    ?? 0, icon: AlertTriangle,  trend: null },
  ]);

  let recentRequests = $derived(dashboardData?.recent_requests ?? []);
  let lowStockItems  = $derived(dashboardData?.low_stock_items  ?? []);

  function statusLabel(s: string) {
    if (s === 'pending')   return { text: 'Menunggu',  cls: 'badge-amber'  };
    if (s === 'rejected')  return { text: 'Ditolak',   cls: 'badge-red'    };
    if (s === 'processed') return { text: 'Diproses',  cls: 'badge-indigo' };
    return { text: 'Selesai', cls: 'badge-green' };
  }
</script>

<svelte:head>
  <title>Dashboard | Khwarizmi Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Page header -->
  <div class="flex items-end justify-between">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Selamat datang kembali, <span class="font-medium text-gray-700">{auth.user?.name ?? "Admin"}</span></p>
    </div>
    <a href="/admin/approvals" class="btn btn-primary text-sm hidden sm:flex">
      <Plus size={15} />
      Persetujuan
    </a>
  </div>

  <!-- Stats grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#if isLoading}
      {#each Array(4) as _}
        <div class="card p-5 animate-pulse space-y-3">
          <div class="h-3 bg-gray-100 rounded w-2/3"></div>
          <div class="h-6 bg-gray-100 rounded w-1/3"></div>
        </div>
      {/each}
    {:else}
      {#each stats as stat, i}
        <div class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{stat.label}</p>
            <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
              <stat.icon size={15} />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
          {#if i === 3 && stat.value > 0}
            <p class="text-[11px] text-red-500 mt-1 font-medium flex items-center gap-1">
              <AlertTriangle size={11} /> Perlu restock
            </p>
          {/if}
        </div>
      {/each}
    {/if}
  </div>

  <!-- Two column -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Recent requests -->
    <div class="card lg:col-span-2">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-[13px] font-semibold text-gray-800">Aktivitas Terbaru</h2>
        <a href="/admin/approvals" class="text-[12px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5">
          Lihat semua <ArrowUpRight size={12} />
        </a>
      </div>

      <div class="divide-y divide-gray-50">
        {#if isLoading}
          {#each Array(4) as _}
            <div class="px-5 py-3.5 flex items-center gap-3 animate-pulse">
              <div class="w-8 h-8 bg-gray-100 rounded-lg shrink-0"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3 bg-gray-100 rounded w-1/3"></div>
                <div class="h-2.5 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          {/each}
        {:else if recentRequests.length === 0}
          <div class="px-5 py-10 text-center text-sm text-gray-400">Belum ada aktivitas</div>
        {:else}
          {#each recentRequests as req}
            {@const st = statusLabel(req.status)}
            <div class="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
              <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Clock size={14} class="text-gray-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-gray-900 truncate">{req.user?.name ?? "—"}</p>
                <p class="text-[11px] text-gray-400 truncate mt-0.5">
                  {req.items?.map((i: any) => i.item?.name).join(", ") || "—"}
                </p>
              </div>
              <span class="badge {st.cls} shrink-0">{st.text}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Low stock -->
    <div class="card">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-[13px] font-semibold text-gray-800">Stok Kritis</h2>
        <a href="/admin/items" class="text-[12px] text-indigo-600 hover:text-indigo-800 font-medium">Kelola</a>
      </div>

      <div class="p-3 space-y-2">
        {#if isLoading}
          {#each Array(3) as _}
            <div class="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
          {/each}
        {:else if lowStockItems.length === 0}
          <div class="py-10 text-center">
            <div class="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={18} class="text-green-600" />
            </div>
            <p class="text-sm font-medium text-gray-700">Semua stok aman</p>
            <p class="text-xs text-gray-400 mt-0.5">Tidak ada barang kritis</p>
          </div>
        {:else}
          {#each lowStockItems as item}
            <div class="flex items-center justify-between px-3 py-2.5 bg-red-50 rounded-xl">
              <div class="min-w-0">
                <p class="text-[12px] font-semibold text-gray-900 truncate">{item.name}</p>
                <p class="text-[10px] text-gray-400">{item.code}</p>
              </div>
              <span class="badge badge-red shrink-0 ml-2">Sisa {item.stock}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
