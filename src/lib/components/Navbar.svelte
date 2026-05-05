<script lang="ts">
  import { Menu, Bell, ChevronDown, LogOut, Settings, User } from "@lucide/svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { api } from "$lib/api";

  let { toggleSidebar } = $props();

  let isProfileOpen = $state(false);

  function toggleProfile() { isProfileOpen = !isProfileOpen; }
  function closeAll() { isProfileOpen = false; }

  async function handleLogout() {
    try { await api.post('/logout', {}); } catch {}
    auth.logout();
    window.location.href = "/";
  }

  let initials = $derived(
    auth.user?.name
      ? auth.user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
      : "?"
  );
</script>

{#if isProfileOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-30" onclick={closeAll}></div>
{/if}

<header class="h-14 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40 relative">
  <!-- Left -->
  <button
    onclick={toggleSidebar}
    class="p-2 -ml-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    aria-label="Toggle sidebar"
  >
    <Menu size={18} />
  </button>

  <!-- Right -->
  <div class="flex items-center gap-2">
    <!-- Notifications bell - shortcut -->
    <a
      href="/admin/approvals"
      class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
      title="Persetujuan"
    >
      <Bell size={17} />
    </a>

    <div class="w-px h-5 bg-gray-200 mx-1"></div>

    <!-- Profile Dropdown -->
    <div class="relative">
      <button
        onclick={toggleProfile}
        class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="w-7 h-7 bg-gray-900 text-white rounded-md flex items-center justify-center font-semibold text-[11px] shrink-0">
          {initials}
        </div>
        <div class="hidden sm:block text-left">
          <p class="text-[13px] font-semibold text-gray-800 leading-none">{auth.user?.name ?? "Admin"}</p>
          <p class="text-[11px] text-gray-400 mt-0.5 leading-none capitalize">{auth.user?.role}</p>
        </div>
        <ChevronDown size={13} class="text-gray-400 hidden sm:block transition-transform {isProfileOpen ? 'rotate-180' : ''}" />
      </button>

      {#if isProfileOpen}
        <div class="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden py-1">
          <!-- User info (mobile) -->
          <div class="sm:hidden px-4 py-3 border-b border-gray-100">
            <p class="text-sm font-semibold text-gray-900">{auth.user?.name}</p>
            <p class="text-xs text-gray-400 mt-0.5">{auth.user?.email}</p>
          </div>

          <a
            href="/admin/settings"
            onclick={closeAll}
            class="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors mx-1 rounded-lg"
          >
            <Settings size={14} class="text-gray-400" />
            Pengaturan
          </a>

          <div class="border-t border-gray-100 mt-1 pt-1 mx-1">
            <button
              onclick={handleLogout}
              class="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>
