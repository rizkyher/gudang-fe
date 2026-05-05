<script lang="ts">
  import { ChevronLeft, Trash2, Plus, Minus, Send, MessageSquare, AlertCircle, Package } from "@lucide/svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { flip } from "svelte/animate";

  // Mock Data: Barang yang dikirim dari halaman Request
  let cartItems = $state([
    { id: "BRG-001", name: "Spidol Snowman Hitam", category: "ATK", qty: 2, stock: 50, icon: "🖋️", unit: "Pcs" },
    { id: "BRG-003", name: "Tinta Printer Epson Black", category: "Elektronik", qty: 1, stock: 5, icon: "💧", unit: "Botol" },
  ]);

  // Form State
  let note = $state("");
  let isUrgent = $state(false);

  // Derivations
  let totalItems = $derived(cartItems.reduce((sum, item) => sum + item.qty, 0));

  // Actions
  function updateQty(id: string, delta: number) {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      const newQty = item.qty + delta;
      if (newQty > 0 && newQty <= item.stock) {
        item.qty = newQty;
      }
    }
  }

  function removeItem(id: string) {
    cartItems = cartItems.filter((i) => i.id !== id);
  }

  function submitRequest() {
    if (cartItems.length === 0) return;
    alert(`Permintaan berhasil dikirim!\nUrgent: ${isUrgent ? "Ya" : "Tidak"}\nCatatan: ${note || "-"}`);
    // Redirect ke halaman Riwayat atau Sukses
    window.location.href = "/user/history";
  }
</script>

<svelte:head>
  <title>Keranjang Permintaan</title>
</svelte:head>

<div class="bg-blue-600 px-6 pt-12 pb-24 rounded-b-[40px] text-white relative shadow-md">
  <div class="flex items-center gap-4 mb-4">
    <a href="/user/request" class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors active:scale-95 shrink-0">
      <ChevronLeft size={24} />
    </a>
    <div>
      <h1 class="text-2xl font-black tracking-tight">Keranjang</h1>
      <p class="text-blue-200 text-xs font-medium mt-0.5">Konfirmasi barang permintaanmu</p>
    </div>
  </div>
</div>

<div class="px-6 -mt-10 relative z-10 space-y-6 pb-40">
  {#if cartItems.length > 0}
    <div class="space-y-3">
      {#each cartItems as item (item.id)}
        <div animate:flip={{ duration: 300 }} out:fade={{ duration: 200 }} class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 shrink-0">
            {item.icon}
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
            <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">{item.category}</p>
            <p class="text-[11px] font-medium text-slate-500 mt-1">Stok: {item.stock} {item.unit}</p>
          </div>

          <div class="flex flex-col items-end gap-2 shrink-0">
            <button onclick={() => removeItem(item.id)} class="text-slate-300 hover:text-rose-500 transition-colors p-1 active:scale-90">
              <Trash2 size={16} strokeWidth={2.5} />
            </button>

            <div class="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1 shadow-inner">
              <button
                onclick={() => updateQty(item.id, -1)}
                disabled={item.qty <= 1}
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm disabled:opacity-50 disabled:shadow-none hover:text-rose-500 transition-all active:scale-90"
              >
                <Minus size={14} strokeWidth={3} />
              </button>

              <span class="w-8 text-center text-xs font-black text-slate-800">{item.qty}</span>

              <button
                onclick={() => updateQty(item.id, 1)}
                disabled={item.qty >= item.stock}
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm disabled:opacity-50 disabled:shadow-none hover:bg-blue-600 hover:text-white transition-all active:scale-90"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-5">
      <div>
        <label for="note" class="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
          <MessageSquare size={14} class="text-blue-500" />
          Keperluan / Catatan
        </label>
        <textarea
          id="note"
          bind:value={note}
          placeholder="Contoh: Untuk keperluan meeting dengan yayasan besok pagi..."
          class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all resize-none h-24"
        ></textarea>
      </div>

      <div class="h-px bg-slate-100 w-full"></div>

      <div>
        <label class="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">
          <AlertCircle size={14} class="text-rose-500" />
          Tingkat Prioritas
        </label>
        <div class="flex gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button onclick={() => (isUrgent = false)} class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all {!isUrgent ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"> Normal </button>
          <button onclick={() => (isUrgent = true)} class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all {isUrgent ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30' : 'text-slate-500 hover:text-rose-500'}">
            Sangat Mendesak
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div in:fade class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
      <div class="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-sm">
        <Package size={40} strokeWidth={1.5} />
      </div>
      <h3 class="text-lg font-black text-slate-800">Keranjang Kosong</h3>
      <p class="text-xs font-medium text-slate-500 mt-2 max-w-[200px]">Belum ada barang yang kamu pilih. Yuk, cari barang kebutuhanmu dulu!</p>
      <a href="/user/request" class="mt-6 px-6 py-3 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors"> Cari Barang </a>
    </div>
  {/if}
</div>

{#if cartItems.length > 0}
  <div in:slide={{ axis: "y", duration: 400 }} class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 p-4">
    <div class="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-[0_-8px_30px_rgb(0,0,0,0.05)] rounded-[2rem] p-4 flex items-center justify-between gap-4">
      <div class="pl-2">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Permintaan</p>
        <p class="text-xl font-black text-slate-800 leading-none mt-1">{totalItems} <span class="text-sm font-semibold text-slate-500 normal-case">Barang</span></p>
      </div>

      <button onclick={submitRequest} class="flex-1 bg-blue-600 text-white py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 group">
        <span class="font-extrabold text-sm tracking-wide">Kirim Sekarang</span>
        <Send size={16} class="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    background-color: #f8fafc;
  }
</style>
