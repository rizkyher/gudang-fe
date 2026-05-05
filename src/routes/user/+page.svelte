<script lang="ts">
  import { Bell, PackagePlus, Clock, CheckCircle, ChevronRight, Package, ArrowUpRight } from "@lucide/svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { api } from "$lib/api";
  import { onMount } from "svelte";

  let stats = $state({ total_requests_month: 0, pending_count: 0, completed_count: 0 });
  let recentRequests = $state<any[]>([]);
  let isLoading = $state(true);

  onMount(async () => {
    try {
      const res = await api.get('/dashboard-summary');
      stats = res.stats;
      recentRequests = (res.recent_requests ?? []).map((r: any) => ({
        id:     r.request_number,
        items:  r.items?.map((i: any) => i.item?.name).filter(Boolean).join(", ") || "—",
        status: r.status,
        date:   new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      }));
    } catch (e) { console.error(e); }
    finally { isLoading = false; }
  });

  function statusInfo(s: string) {
    if (s === "pending")   return { label: "Menunggu",  cls: "badge-amber"  };
    if (s === "rejected")  return { label: "Ditolak",   cls: "badge-red"    };
    if (s === "processed") return { label: "Diproses",  cls: "badge-indigo" };
    return { label: "Selesai", cls: "badge-green" };
  }

  let greeting = $derived(() => {
    const h = new Date().getHours();
    if (h < 12) return "Selamat Pagi";
    if (h < 17) return "Selamat Siang";
    return "Selamat Sore";
  });
</script>

<svelte:head>
  <title>Beranda | Khwarizmi Inventory</title>
</svelte:head>

<!-- Top area -->
<div class="px-5 pt-10 pb-6 bg-white border-b border-gray-100">
  <div class="flex items-start justify-between mb-5">
    <div>
      <p class="text-[12px] text-gray-400 font-medium">{greeting()}</p>
      <h1 class="text-[22px] font-bold text-gray-900 tracking-tight mt-0.5">{auth.user?.name ?? "—"}</h1>
    </div>
    <a
      href="/user/notifications"
      class="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
    >
      <Bell size={17} />
    </a>
  </div>

  <!-- Quick action -->
  <a
    href="/user/request"
    class="flex items-center justify-between bg-gray-900 text-white rounded-2xl px-5 py-4 hover:bg-gray-800 transition-colors group active:scale-[0.99]"
  >
    <div>
      <p class="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Kebutuhan barang?</p>
      <p class="text-[15px] font-semibold mt-0.5">Ajukan Permintaan</p>
    </div>
    <div class="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
      <PackagePlus size={18} />
    </div>
  </a>
</div>

<!-- Stats -->
<div class="px-5 py-5 grid grid-cols-3 gap-3">
  {#if isLoading}
    {#each Array(3) as _}
      <div class="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse space-y-2">
        <div class="h-3 bg-gray-100 rounded w-3/4"></div>
        <div class="h-5 bg-gray-100 rounded w-1/2"></div>
      </div>
    {/each}
  {:else}
    <div class="bg-white border border-gray-100 rounded-2xl p-4">
      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Bulan Ini</p>
      <p class="text-xl font-bold text-gray-900 mt-1">{stats.total_requests_month}</p>
    </div>
    <div class="bg-white border border-gray-100 rounded-2xl p-4">
      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Diproses</p>
      <p class="text-xl font-bold text-gray-900 mt-1">{stats.pending_count}</p>
    </div>
    <div class="bg-white border border-gray-100 rounded-2xl p-4">
      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Selesai</p>
      <p class="text-xl font-bold text-gray-900 mt-1">{stats.completed_count}</p>
    </div>
  {/if}
</div>

<!-- Recent Requests -->
<div class="px-5 pb-6">
  <div class="flex items-center justify-between mb-3">
    <h2 class="text-[13px] font-semibold text-gray-800">Permintaan Terakhir</h2>
    <a href="/user/history" class="text-[12px] text-indigo-600 font-medium flex items-center gap-0.5 hover:text-indigo-800">
      Semua <ArrowUpRight size={12} />
    </a>
  </div>

  <div class="space-y-2">
    {#if isLoading}
      {#each Array(3) as _}
        <div class="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex items-center gap-3">
          <div class="w-9 h-9 bg-gray-100 rounded-xl shrink-0"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-gray-100 rounded w-2/5"></div>
            <div class="h-2.5 bg-gray-100 rounded w-3/5"></div>
          </div>
        </div>
      {/each}
    {:else if recentRequests.length === 0}
      <div class="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Package size={20} class="text-gray-400" />
        </div>
        <p class="text-sm font-medium text-gray-700">Belum ada permintaan</p>
        <p class="text-xs text-gray-400 mt-1">Klik "Minta" di bawah untuk mulai</p>
      </div>
    {:else}
      {#each recentRequests as req}
        {@const st = statusInfo(req.status)}
        <a href="/user/history" class="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:border-gray-200 transition-colors block active:bg-gray-50">
          <div class="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={15} class="text-gray-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-gray-900">{req.id}</p>
            <p class="text-[11px] text-gray-400 truncate mt-0.5">{req.items}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="badge {st.cls}">{st.label}</span>
            <p class="text-[10px] text-gray-400">{req.date}</p>
          </div>
        </a>
      {/each}
    {/if}
  </div>
</div>
