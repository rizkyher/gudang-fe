<script lang="ts">
  import { Eye, EyeOff } from "@lucide/svelte";
  import { goto, invalidateAll } from "$app/navigation";
  import { api } from "$lib/api";

  let email        = $state("");
  let password     = $state("");
  let showPassword = $state(false);
  let isLoading    = $state(false);
  let error        = $state("");

  async function handleLogin(e: Event) {
    e.preventDefault();
    error = "";
    if (!email || !password) { error = "Lengkapi semua field."; return; }
    isLoading = true;
    try {
      const res = await api.post('/auth/login', { email, password });
      // Simpan ke localStorage sebagai fallback bearer token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
      }
      // Reload semua server load functions → +layout.server.ts membaca cookie baru
      await invalidateAll();
      goto(res.user.role === 'admin' ? '/admin' : '/user');
    } catch (err: any) {
      error = err.message || "Email atau password salah.";
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Masuk | Khwarizmi Inventory</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
  <div class="w-full max-w-sm">

    <!-- Brand -->
    <div class="mb-10">
      <div class="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-6">K</div>
      <h1 class="text-[22px] font-bold text-gray-900 tracking-tight">Masuk ke akun Anda</h1>
      <p class="text-[14px] text-gray-500 mt-1.5">Sistem Inventaris Gudang Khwarizmi Academy</p>
    </div>

    <!-- Form -->
    <form onsubmit={handleLogin} class="space-y-4">
      <div class="space-y-1.5">
        <label for="email" class="text-[12px] font-semibold text-gray-600">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="nama@khwarizmi.sch.id"
          autocomplete="email"
          class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15 transition-all"
        />
      </div>

      <div class="space-y-1.5">
        <label for="password" class="text-[12px] font-semibold text-gray-600">Password</label>
        <div class="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            bind:value={password}
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15 transition-all"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {#if showPassword}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
          </button>
        </div>
      </div>

      {#if error}
        <p class="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
      {/if}

      <button
        type="submit"
        disabled={isLoading}
        class="w-full bg-gray-900 hover:bg-gray-700 text-white py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 shadow-sm mt-2"
      >
        {#if isLoading}
          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Masuk...</span>
        {:else}
          Masuk ke Dashboard
        {/if}
      </button>
    </form>

    <p class="text-center text-[12px] text-gray-400 mt-8">
      Belum punya akun? <a href="/register" class="text-gray-700 font-semibold hover:text-gray-900">Daftar</a>
    </p>
  </div>
</div>
