<script lang="ts">
  import { Search, Plus, Minus, ShoppingBag, Package, X, CheckCircle } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import { api } from "$lib/api";
  import { onMount } from "svelte";

  let availableItems = $state<any[]>([]);
  let isLoadingData  = $state(true);
  let searchQuery    = $state("");
  let activeCategory = $state("Semua");
  let cart: Record<string, number> = $state({});
  let isSubmitting   = $state(false);
  let submitted      = $state(false);

  let categories = $derived(["Semua", ...new Set(availableItems.map(i => i.category))]);
  let filtered   = $derived(
    availableItems.filter(i =>
      (activeCategory === "Semua" || i.category === activeCategory) &&
      i.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  let totalCartItems = $derived(Object.values(cart).reduce((a, b) => a + b, 0));

  onMount(async () => {
    try {
      const data = await api.get('/items');
      availableItems = data.map((item: any) => ({
        id: item.id, code: item.code, name: item.name,
        category: item.category?.name || item.categories?.name || "Lainnya",
        stock: item.stock, unit: item.unit,
      }));
    } catch (e) { console.error(e); }
    finally { isLoadingData = false; }
  });

  function addToCart(id: string, maxStock: number) {
    if (!cart[id]) cart[id] = 0;
    if (cart[id] < maxStock) cart[id] += 1;
  }
  function removeFromCart(id: string) {
    if (cart[id] > 0) {
      cart[id] -= 1;
      if (cart[id] === 0) delete cart[id];
    }
  }

  async function submitRequest() {
    if (totalCartItems === 0) return;
    isSubmitting = true;
    try {
      await api.post('/requests', {
        notes: "Pengajuan dari aplikasi",
        items: Object.entries(cart).map(([id, qty]) => ({ id: parseInt(id), quantity: qty }))
      });
      cart = {};
      submitted = true;
      setTimeout(() => { submitted = false; }, 3000);
      const data = await api.get('/items');
      availableItems = data.map((item: any) => ({
        id: item.id, code: item.code, name: item.name,
        category: item.category?.name || item.categories?.name || "Lainnya",
        stock: item.stock, unit: item.unit,
      }));
    } catch (e: any) { alert(e.message || "Gagal mengajukan permintaan"); }
    finally { isSubmitting = false; }
  }
</script>

<svelte:head>
  <title>Minta Barang | Khwarizmi Inventory</title>
</svelte:head>

<!-- Header -->
<div class="px-5 pt-10 pb-4 bg-white border-b border-gray-100 sticky top-0 z-20">
  <h1 class="text-[20px] font-bold text-gray-900 mb-4">Minta Barang</h1>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Search size={15} class="text-gray-400" />
    </div>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Cari barang..."
      class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15 transition-all"
    />
  </div>
</div>

<!-- Categories -->
<div class="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-none">
  {#each categories as cat}
    <button
      onclick={() => (activeCategory = cat)}
      class="px-4 py-1.5 rounded-xl text-[12px] font-semibold shrink-0 transition-all border
        {activeCategory === cat
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}"
    >
      {cat}
    </button>
  {/each}
</div>

<!-- Success toast -->
{#if submitted}
  <div transition:fly={{ y: -20, duration: 300 }} class="mx-5 mb-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-3.5 flex items-center gap-3">
    <CheckCircle size={16} class="shrink-0" />
    <p class="text-[13px] font-semibold">Permintaan berhasil diajukan!</p>
  </div>
{/if}

<!-- Item list -->
<div class="px-5 pb-32 space-y-2">
  {#if isLoadingData}
    {#each Array(5) as _}
      <div class="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex items-center gap-3">
        <div class="w-12 h-12 bg-gray-100 rounded-xl shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-100 rounded w-2/5"></div>
          <div class="h-2.5 bg-gray-100 rounded w-3/5"></div>
        </div>
      </div>
    {/each}
  {:else if filtered.length === 0}
    <div class="py-16 text-center">
      <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Package size={20} class="text-gray-400" />
      </div>
      <p class="text-sm font-semibold text-gray-700">Barang tidak ditemukan</p>
    </div>
  {:else}
    {#each filtered as item (item.id)}
      <div class="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:border-gray-200 transition-colors">
        <!-- Icon placeholder -->
        <div class="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
          <Package size={20} class="text-gray-400" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-[11px] text-gray-400 font-medium">{item.category}</p>
          <p class="text-[14px] font-semibold text-gray-900 truncate mt-0.5">{item.name}</p>
          <div class="flex items-center gap-1.5 mt-1">
            {#if item.stock > 0}
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
              <p class="text-[11px] text-gray-400">Sisa {item.stock} {item.unit}</p>
            {:else}
              <span class="w-1.5 h-1.5 bg-red-400 rounded-full inline-block"></span>
              <p class="text-[11px] text-red-500">Stok habis</p>
            {/if}
          </div>
        </div>

        <!-- Cart controls -->
        {#if item.stock > 0}
          <div class="flex items-center gap-2 shrink-0">
            {#if cart[item.id]}
              <button
                onclick={() => removeFromCart(item.id)}
                class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all active:scale-95"
              >
                <Minus size={14} />
              </button>
              <span class="text-[14px] font-bold text-gray-900 w-5 text-center">{cart[item.id]}</span>
            {/if}
            <button
              onclick={() => addToCart(item.id, item.stock)}
              class="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition-all active:scale-95"
            >
              <Plus size={14} />
            </button>
          </div>
        {:else}
          <span class="badge badge-gray">Habis</span>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<!-- Floating Submit -->
{#if totalCartItems > 0}
  <div in:fly={{ y: 80, duration: 300 }} out:fade class="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md z-40">
    <button
      onclick={submitRequest}
      disabled={isSubmitting}
      class="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-2xl px-5 py-4 flex items-center justify-between transition-all active:scale-[0.99] disabled:opacity-60 shadow-xl shadow-gray-900/20"
    >
      <div class="flex items-center gap-3">
        <div class="relative">
          <ShoppingBag size={20} />
          <span class="absolute -top-2.5 -right-2.5 bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {totalCartItems}
          </span>
        </div>
        <div class="text-left">
          <p class="text-[14px] font-semibold">{isSubmitting ? "Memproses..." : "Ajukan Sekarang"}</p>
          <p class="text-[11px] text-gray-400">{totalCartItems} barang dipilih</p>
        </div>
      </div>
      {#if isSubmitting}
        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      {:else}
        <div class="w-7 h-7 bg-white/10 rounded-xl flex items-center justify-center">
          <Plus size={15} class="rotate-45 opacity-0" />
        </div>
      {/if}
    </button>
  </div>
{/if}
