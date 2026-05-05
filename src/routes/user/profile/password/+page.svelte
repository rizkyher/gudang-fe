<script lang="ts">
  import {
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    Eye,
    EyeOff,
    LockKeyhole,
  } from "@lucide/svelte";
  import { fly } from "svelte/transition";
  import { api } from "$lib/api";

  let oldPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");

  let showOld = $state(false);
  let showNew = $state(false);
  let showConfirm = $state(false);

  let isSubmitting = $state(false);
  let success = $state(false);

  // Derivations for visual feedback
  let passwordStrength = $derived(() => {
    let strength = 0;
    if (newPassword.length >= 6) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    return strength;
  });

  let doPasswordsMatch = $derived(
    newPassword !== "" && newPassword === confirmPassword,
  );
  let isFormValid = $derived(
    oldPassword !== "" && newPassword.length >= 6 && doPasswordsMatch,
  );

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-slate-200";
    if (strength <= 2) return "bg-rose-400";
    if (strength === 3) return "bg-amber-400";
    return "bg-emerald-500";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return "Sangat Lemah";
    if (strength <= 2) return "Lemah";
    if (strength === 3) return "Sedang";
    return "Kuat";
  };

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isFormValid) return;

    isSubmitting = true;
    try {
        await api.put('/update-password', {
            current_password: oldPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword
        });
        success = true;
        setTimeout(() => {
            window.location.href = "/user/profile";
        }, 2000);
    } catch (e: any) {
        alert(e.message || "Gagal mengubah password. Pastikan password lama benar.");
    } finally {
        isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Ganti Password | Khwarizmi Gudang</title>
</svelte:head>

<!-- Header -->
<div
  class="bg-blue-600 px-6 pt-12 pb-24 rounded-b-[40px] text-white relative shadow-md z-20"
>
  <div class="flex items-center gap-4 mb-4">
    <a
      href="/user/profile"
      class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors active:scale-95 shrink-0"
    >
      <ArrowLeft size={24} />
    </a>
    <div>
      <h1 class="text-xl font-black tracking-tight">Ganti Password</h1>
      <p class="text-blue-200 text-xs font-medium mt-0.5">
        Amankan akun Anda secara berkala
      </p>
    </div>
  </div>
</div>

<main class="px-6 -mt-16 relative z-30 pb-24 space-y-6">
  {#if success}
    <div
      in:fly={{ y: 20, duration: 400 }}
      class="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center shadow-lg shadow-emerald-500/10"
    >
      <div
        class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"
      >
        <CheckCircle2 size={32} strokeWidth={2.5} />
      </div>
      <h2 class="text-lg font-black text-slate-800">
        Password Berhasil Diubah!
      </h2>
      <p class="text-sm font-medium text-slate-500 mt-2">
        Mengalihkan ke halaman profil...
      </p>
    </div>
  {:else}
    <form
      in:fly={{ y: 20, duration: 400 }}
      onsubmit={handleSubmit}
      class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5"
    >
      <div class="flex justify-center mb-6">
        <div
          class="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center border-[6px] border-white shadow-sm"
        >
          <ShieldCheck size={36} strokeWidth={1.5} />
        </div>
      </div>

      <!-- Password Lama -->
      <div>
        <label
          for="oldPassword"
          class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
          >Password Saat Ini</label
        >
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"
          >
            <LockKeyhole size={18} />
          </div>
          <input
            id="oldPassword"
            type={showOld ? "text" : "password"}
            bind:value={oldPassword}
            placeholder="Masukkan password saat ini"
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
            required
          />
          <button
            type="button"
            onclick={() => (showOld = !showOld)}
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
          >
            {#if showOld}
              <EyeOff size={18} />
            {:else}
              <Eye size={18} />
            {/if}
          </button>
        </div>
      </div>

      <div class="h-px bg-slate-100 w-full my-4"></div>

      <!-- Password Baru -->
      <div>
        <label
          for="newPassword"
          class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
          >Password Baru</label
        >
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"
          >
            <LockKeyhole size={18} />
          </div>
          <input
            id="newPassword"
            type={showNew ? "text" : "password"}
            bind:value={newPassword}
            placeholder="Buat password baru"
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
            required
            minlength="6"
          />
          <button
            type="button"
            onclick={() => (showNew = !showNew)}
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
          >
            {#if showNew}
              <EyeOff size={18} />
            {:else}
              <Eye size={18} />
            {/if}
          </button>
        </div>

        <!-- Strength Indicator -->
        {#if newPassword.length > 0}
          <div class="mt-3" transition:fly={{ y: -5, duration: 200 }}>
            <div
              class="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-slate-100 mb-1.5"
            >
              <div
                class="h-full {passwordStrength() >= 1
                  ? getStrengthColor(passwordStrength())
                  : 'bg-transparent'} transition-colors duration-300 w-1/4"
              ></div>
              <div
                class="h-full {passwordStrength() >= 2
                  ? getStrengthColor(passwordStrength())
                  : 'bg-transparent'} transition-colors duration-300 w-1/4"
              ></div>
              <div
                class="h-full {passwordStrength() >= 3
                  ? getStrengthColor(passwordStrength())
                  : 'bg-transparent'} transition-colors duration-300 w-1/4"
              ></div>
              <div
                class="h-full {passwordStrength() >= 4
                  ? getStrengthColor(passwordStrength())
                  : 'bg-transparent'} transition-colors duration-300 w-1/4"
              ></div>
            </div>
            <div
              class="flex justify-between items-center text-[10px] font-bold"
            >
              <span
                class={getStrengthColor(passwordStrength()).replace(
                  "bg-",
                  "text-",
                )}
              >
                Kekuatan: {getStrengthLabel(passwordStrength())}
              </span>
              <span class="text-slate-400">Minimal 6 karakter</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Konfirmasi Password -->
      <div>
        <label
          for="confirmPassword"
          class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
          >Konfirmasi Password Baru</label
        >
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"
          >
            <LockKeyhole size={18} />
          </div>
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            bind:value={confirmPassword}
            placeholder="Ketik ulang password baru"
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all {confirmPassword.length >
              0 && !doPasswordsMatch
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20'
              : ''}"
            required
          />
          <button
            type="button"
            onclick={() => (showConfirm = !showConfirm)}
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
          >
            {#if showConfirm}
              <EyeOff size={18} />
            {:else}
              <Eye size={18} />
            {/if}
          </button>
        </div>
        {#if confirmPassword.length > 0 && !doPasswordsMatch}
          <p
            class="text-[10px] font-bold text-rose-500 mt-2 ml-1"
            transition:fly={{ y: -5, duration: 200 }}
          >
            Password tidak cocok!
          </p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        class="w-full bg-blue-600 text-white h-14 rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-blue-600 mt-4"
      >
        {#if isSubmitting}
          <div
            class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></div>
          <span>Menyimpan...</span>
        {:else}
          <CheckCircle2 size={20} />
          <span>Simpan Password</span>
        {/if}
      </button>
    </form>
  {/if}
</main>

<style>
  :global(body) {
    background-color: #f8fafc;
  }
</style>
