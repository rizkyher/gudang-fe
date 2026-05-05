<script lang="ts">
  import {
    User,
    Settings as SettingsIcon,
    Save,
    KeyRound,
    Building,
    Mail,
    Phone,
    CheckCircle2,
  } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";

  let activeTab = $state("Profil Admin");
  const tabs = [
    { id: "Profil Admin", icon: User, label: "Profil Admin" },
    { id: "Pengaturan Gudang", icon: SettingsIcon, label: "Pengaturan Gudang" },
  ];

  let adminName = $state("Admin Utama");
  let adminEmail = $state("admin@khwarizmi.com");
  let oldPassword = $state("");
  let newPassword = $state("");

  let warehouseName = $state("Gudang Pusat Khwarizmi");
  let warehouseAddress = $state("Jl. Pendidikan No. 123, Kota Pelajar");
  let notifEmail = $state("notifikasi@khwarizmi.com");
  let notifPhone = $state("+62 812-3456-7890");

  let isSubmitting = $state(false);
  let showSuccess = $state(false);

  function handleSave(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    setTimeout(() => {
      isSubmitting = false;
      showSuccess = true;
      setTimeout(() => {
        showSuccess = false;
      }, 3000);
    }, 900);
  }

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow font-medium text-slate-800 placeholder:text-slate-400";
  const labelClass =
    "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5";
</script>

<svelte:head>
  <title>Pengaturan · Khwarizmi</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-black text-slate-900 tracking-tight">
      Pengaturan Sistem
    </h1>
    <p class="text-sm text-slate-500 mt-1">
      Kelola profil dan konfigurasi operasional gudang.
    </p>
  </div>

  <div
    class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]"
  >
    <!-- Sidebar Tabs -->
    <div
      class="md:w-56 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3 shrink-0"
    >
      <p
        class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2"
      >
        Menu
      </p>
      <div class="space-y-1">
        {#each tabs as tab}
          <button
            onclick={() => (activeTab = tab.id)}
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold
              {activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800'}"
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6 lg:p-10 relative overflow-hidden">
      <!-- Success Toast -->
      {#if showSuccess}
        <div
          transition:fly={{ y: -16, duration: 260 }}
          class="absolute top-6 right-6 bg-white border border-emerald-200 shadow-lg shadow-emerald-500/10 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2.5 z-10"
        >
          <CheckCircle2 size={16} class="text-emerald-500" />
          <span class="text-sm font-bold">Perubahan berhasil disimpan!</span>
        </div>
      {/if}

      {#if activeTab === "Profil Admin"}
        <div in:fade={{ duration: 160 }} class="max-w-2xl">
          <div class="flex items-center gap-3 mb-8">
            <div
              class="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl"
            >
              {adminName.charAt(0)}
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">{adminName}</h2>
              <p class="text-sm text-slate-400">{adminEmail}</p>
            </div>
          </div>

          <form onsubmit={handleSave} class="space-y-6">
            <div>
              <h3
                class="text-sm font-black text-slate-700 mb-4 flex items-center gap-2"
              >
                <User size={16} class="text-blue-600" /> Informasi Profil
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="adminName" class={labelClass}>Nama Lengkap</label>
                  <input
                    id="adminName"
                    type="text"
                    bind:value={adminName}
                    class={inputClass}
                    required
                  />
                </div>
                <div>
                  <label for="adminEmail" class={labelClass}>Alamat Email</label
                  >
                  <input
                    id="adminEmail"
                    type="email"
                    bind:value={adminEmail}
                    class={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div class="h-px bg-slate-100"></div>

            <div>
              <h3
                class="text-sm font-black text-slate-700 mb-4 flex items-center gap-2"
              >
                <KeyRound size={16} class="text-blue-600" /> Ubah Password
              </h3>
              <div class="space-y-3">
                <div>
                  <label for="oldPwd" class={labelClass}>Password Lama</label>
                  <input
                    id="oldPwd"
                    type="password"
                    bind:value={oldPassword}
                    placeholder="Kosongkan jika tidak ingin diubah"
                    class={inputClass}
                  />
                </div>
                <div>
                  <label for="newPwd" class={labelClass}>Password Baru</label>
                  <input
                    id="newPwd"
                    type="password"
                    bind:value={newPassword}
                    placeholder="Minimal 8 karakter"
                    class={inputClass}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              class="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm"
            >
              {#if isSubmitting}
                <div
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
                Menyimpan…
              {:else}
                <Save size={16} /> Simpan Perubahan
              {/if}
            </button>
          </form>
        </div>
      {:else}
        <div in:fade={{ duration: 160 }} class="max-w-2xl">
          <div class="flex items-center gap-3 mb-8">
            <div
              class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"
            >
              <Building size={22} class="text-blue-600" />
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">
                Pengaturan Gudang
              </h2>
              <p class="text-sm text-slate-400">
                Profil dan kontak operasional
              </p>
            </div>
          </div>

          <form onsubmit={handleSave} class="space-y-6">
            <div>
              <h3
                class="text-sm font-black text-slate-700 mb-4 flex items-center gap-2"
              >
                <Building size={16} class="text-blue-600" /> Identitas Gudang
              </h3>
              <div class="space-y-3">
                <div>
                  <label for="whName" class={labelClass}
                    >Nama Gudang / Sistem</label
                  >
                  <input
                    id="whName"
                    type="text"
                    bind:value={warehouseName}
                    class={inputClass}
                    required
                  />
                </div>
                <div>
                  <label for="whAddr" class={labelClass}
                    >Alamat Operasional</label
                  >
                  <textarea
                    id="whAddr"
                    bind:value={warehouseAddress}
                    rows="3"
                    class="{inputClass} resize-none leading-relaxed"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="h-px bg-slate-100"></div>

            <div>
              <h3
                class="text-sm font-black text-slate-700 mb-4 flex items-center gap-2"
              >
                <Mail size={16} class="text-blue-600" /> Kontak & Notifikasi
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="nEmail" class={labelClass}>Email Notifikasi</label
                  >
                  <div class="relative">
                    <Mail
                      size={15}
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="nEmail"
                      type="email"
                      bind:value={notifEmail}
                      class="{inputClass} pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label for="nPhone" class={labelClass}>Telepon Darurat</label>
                  <div class="relative">
                    <Phone
                      size={15}
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="nPhone"
                      type="text"
                      bind:value={notifPhone}
                      class="{inputClass} pl-9"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              class="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm"
            >
              {#if isSubmitting}
                <div
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
                Menyimpan…
              {:else}
                <Save size={16} /> Simpan Pengaturan
              {/if}
            </button>
          </form>
        </div>
      {/if}
    </div>
  </div>
</div>
