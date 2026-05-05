<script lang="ts">
  import { User, Mail, KeyRound, ChevronRight, LogOut } from "@lucide/svelte";
  import { auth } from "$lib/stores/auth.svelte";
  import { api } from "$lib/api";

  async function handleLogout() {
    if (!confirm("Yakin ingin keluar?")) return;
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

<svelte:head>
  <title>Profil | Khwarizmi Inventory</title>
</svelte:head>

<!-- Header -->
<div class="px-5 pt-10 pb-8 bg-white border-b border-gray-100 flex flex-col items-center text-center">
  <div class="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl mb-4">
    {initials}
  </div>
  <h1 class="text-[17px] font-bold text-gray-900">{auth.user?.name}</h1>
  <p class="text-[12px] text-gray-400 mt-1">{auth.user?.email}</p>
  <span class="mt-3 badge {auth.user?.role === 'admin' ? 'badge-indigo' : 'badge-gray'} capitalize">
    {auth.user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
  </span>
</div>

<!-- Menu items -->
<div class="px-5 py-5 space-y-2">
  <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
    <div class="flex items-center gap-3 px-4 py-3.5">
      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
        <Mail size={14} class="text-gray-500" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[11px] text-gray-400">Email</p>
        <p class="text-[13px] font-medium text-gray-800 truncate">{auth.user?.email}</p>
      </div>
    </div>

    <a href="/user/profile/password" class="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group">
      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
        <KeyRound size={14} class="text-gray-500" />
      </div>
      <div class="flex-1">
        <p class="text-[13px] font-medium text-gray-800">Ganti Password</p>
      </div>
      <ChevronRight size={15} class="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </a>
  </div>

  <button
    onclick={handleLogout}
    class="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors mt-3 group"
  >
    <div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
      <LogOut size={14} />
    </div>
    <span class="text-[13px] font-semibold">Keluar dari Aplikasi</span>
  </button>
</div>

<p class="text-center text-[11px] text-gray-300 pb-6">v1.0.0 &copy; 2026 Khwarizmi Academy</p>
