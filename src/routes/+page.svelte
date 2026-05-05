<script lang="ts">
  import { auth } from "$lib/stores/auth.svelte";
  import { goto } from "$app/navigation";
  import { Package } from "@lucide/svelte";
  import { onMount } from "svelte";

  let isCheckingAuth = $state(true);

  onMount(() => {
    auth.init();
    setTimeout(() => {
      if (auth.isAuthenticated) {
        goto(auth.user?.role === "admin" ? "/admin" : "/user");
      } else {
        isCheckingAuth = false;
      }
    }, 150);
  });
</script>

<svelte:head>
  <title>Khwarizmi Inventory</title>
</svelte:head>

{#if isCheckingAuth}
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="px-8 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
        <span class="text-[15px] font-semibold text-gray-900 tracking-tight">Khwarizmi</span>
      </div>
      <a href="/login" class="text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
        Masuk →
      </a>
    </header>

    <!-- Hero -->
    <div class="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-lg mx-auto w-full">
      <div class="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-8">
        <Package size={30} strokeWidth={1.5} />
      </div>

      <h1 class="text-[36px] md:text-[44px] font-bold text-gray-900 tracking-tight leading-tight mb-4">
        Manajemen Gudang<br />yang Efisien
      </h1>

      <p class="text-[15px] text-gray-500 leading-relaxed mb-10 max-w-sm">
        Kelola inventaris, proses permintaan barang, dan pantau stok dengan satu sistem terpadu.
      </p>

      <a
        href="/login"
        class="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-7 py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] shadow-sm"
      >
        Mulai Sekarang
      </a>
    </div>

    <footer class="px-8 py-6 text-center text-[12px] text-gray-400">
      &copy; 2026 Khwarizmi Academy. Semua hak dilindungi.
    </footer>
  </div>
{/if}
