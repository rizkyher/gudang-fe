<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";

  let { children } = $props();
  let isSidebarOpen = $state(true);
</script>

<!--
  KRITIS: overflow-hidden di root agar tidak ada double scrollbar.
  Sidebar: fixed width, shrink-0.
  Main: flex-1 + min-w-0 supaya tidak meluap ke kanan.
  main tag: satu-satunya yang boleh scroll.
-->
<div class="flex h-screen bg-slate-50 overflow-hidden">
  <Sidebar {isSidebarOpen} />

  <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
    <Navbar toggleSidebar={() => (isSidebarOpen = !isSidebarOpen)} />

    <main class="flex-1 overflow-y-auto overflow-x-hidden">
      <div class="p-4 sm:p-6 w-full max-w-[1400px] mx-auto">
        {@render children()}
      </div>
    </main>
  </div>
</div>
