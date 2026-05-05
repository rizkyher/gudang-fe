<script lang="ts">
  import { page } from "$app/stores";
  import {
    LayoutDashboard, Box, PackagePlus, Tags, ClipboardCheck,
    Users, FileBarChart, ChevronLeft, ChevronRight,
    Truck, RotateCcw, Contact, ScanLine
  } from "@lucide/svelte";

  let { isSidebarOpen } = $props();

  const menus = [
    { name: "Dashboard",        href: "/admin",              icon: LayoutDashboard },
    { name: "Persetujuan",      href: "/admin/approvals",    icon: ClipboardCheck  },
    { name: "Master Barang",    href: "/admin/items",        icon: Box             },
    { name: "Kategori & Rak",   href: "/admin/categories",   icon: Tags            },
    { name: "Stock Masuk",      href: "/admin/stock-in",     icon: PackagePlus     },
    { name: "Stock Opname",     href: "/admin/stock-opname", icon: ScanLine        },
    { name: "Delivery Order",   href: "/admin/delivery-orders", icon: Truck        },
    { name: "Return Barang",    href: "/admin/returns",      icon: RotateCcw       },
    { name: "Partner Bisnis",   href: "/admin/partners",     icon: Contact         },
    { name: "User Management",  href: "/admin/users",        icon: Users           },
    { name: "Laporan",          href: "/admin/reports",      icon: FileBarChart    },
  ];

  let currentPath = $derived($page.url.pathname);

  function isActive(href: string) {
    if (href === "/admin" && currentPath === "/admin") return true;
    if (href !== "/admin" && currentPath.startsWith(href)) return true;
    return false;
  }
</script>

<aside
  class="h-full flex flex-col bg-white border-r border-gray-100 shrink-0 overflow-y-auto hidden sm:flex transition-[width] duration-300 ease-in-out relative z-20"
  style="width: {isSidebarOpen ? '220px' : '64px'}"
>
  <!-- Logo -->
  <div class="h-14 flex items-center px-3 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
    <div class="flex items-center gap-3 overflow-hidden w-full">
      <div class="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">K</div>
      {#if isSidebarOpen}
        <div class="min-w-0 overflow-hidden">
          <p class="text-sm font-semibold text-gray-900 truncate tracking-tight">Khwarizmi</p>
          <p class="text-[10px] text-gray-400 truncate">Inventory System</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-2 py-3 space-y-0.5">
    {#if isSidebarOpen}
      <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 py-2">Menu</p>
    {/if}

    {#each menus as menu}
      {@const active = isActive(menu.href)}
      <a
        href={menu.href}
        title={!isSidebarOpen ? menu.name : ""}
        class="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 group relative overflow-hidden
          {active
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}"
      >
        <div class="shrink-0 w-5 h-5 flex items-center justify-center">
          <menu.icon size={18} strokeWidth={active ? 2.5 : 2} />
        </div>

        {#if isSidebarOpen}
          <span class="text-[13px] font-medium truncate">{menu.name}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Footer -->
  {#if isSidebarOpen}
    <div class="px-4 py-3 border-t border-gray-100">
      <p class="text-[10px] text-gray-400">v1.0.0 &copy; 2026</p>
    </div>
  {/if}
</aside>
