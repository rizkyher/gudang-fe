<script lang="ts">
  import { Home, PackagePlus, ClipboardList, User } from "@lucide/svelte";
  import { page } from "$app/stores";

  let { children } = $props();

  const navItems = [
    { name: "Beranda", href: "/user",         icon: Home          },
    { name: "Minta",   href: "/user/request",  icon: PackagePlus   },
    { name: "Riwayat", href: "/user/history",  icon: ClipboardList },
    { name: "Profil",  href: "/user/profile",  icon: User          },
  ];

  let currentPath = $derived($page.url.pathname);

  const isActiveRoute = (href: string, path: string) => {
    if (href === "/user") return path === "/user" || path === "/user/";
    return path.startsWith(href);
  };
</script>

<div class="min-h-dvh bg-gray-100 flex justify-center">
  <div class="w-full max-w-md bg-white min-h-dvh flex flex-col relative shadow-2xl shadow-gray-300/50">
    <!-- Content -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden pb-24 scrollbar-none">
      {@render children()}
    </main>

    <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-5 pt-2 pointer-events-none">
      <div class="bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-gray-900/10 rounded-2xl px-2 py-2 flex justify-around items-center pointer-events-auto">
        {#each navItems as item}
          {@const active = isActiveRoute(item.href, currentPath)}
          <a
            href={item.href}
            class="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95
              {active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}"
          >
            {#if active}
              <div class="absolute inset-0 bg-gray-100 rounded-xl -z-10"></div>
            {/if}
            <item.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span class="text-[10px] font-semibold tracking-wide">{item.name}</span>
          </a>
        {/each}
      </div>
    </nav>
  </div>
</div>

<style>
  :global(.scrollbar-none::-webkit-scrollbar) { display: none; }
  :global(.scrollbar-none) { -ms-overflow-style: none; scrollbar-width: none; }
</style>
