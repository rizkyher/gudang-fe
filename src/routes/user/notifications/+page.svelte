<script lang="ts">
  import { Bell, ArrowLeft, CheckCircle, XCircle, Trash2 } from "@lucide/svelte";
  import { api } from "$lib/api";
  import { onMount } from "svelte";

  let notifications = $state<any[]>([]);
  let isLoading = $state(true);

  onMount(() => refreshNotifications());

  async function refreshNotifications() {
    isLoading = true;
    try { notifications = await api.get('/notifications'); }
    catch (e) { console.error(e); }
    finally { isLoading = false; }
  }

  async function markRead(id: number) {
    try {
      await api.put(`/notifications/${id}/read`, {});
      notifications = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    } catch (e) { console.error(e); }
  }

  async function deleteNotif(e: Event, id: number) {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      notifications = notifications.filter(n => n.id !== id);
    } catch (e) { console.error(e); }
  }

  let unread = $derived(notifications.filter(n => !n.is_read).length);
</script>

<svelte:head>
  <title>Notifikasi | Khwarizmi Inventory</title>
</svelte:head>

<!-- Header -->
<div class="px-5 pt-10 pb-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
  <div class="flex items-center gap-3">
    <a href="/user" class="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
      <ArrowLeft size={18} />
    </a>
    <div>
      <h1 class="text-[16px] font-bold text-gray-900">Notifikasi</h1>
      {#if unread > 0}
        <p class="text-[11px] text-indigo-600 font-medium">{unread} belum dibaca</p>
      {/if}
    </div>
  </div>
  <button onclick={refreshNotifications} class="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors">
    Muat Ulang
  </button>
</div>

<!-- List -->
<div class="px-5 py-4 space-y-2">
  {#if isLoading}
    {#each Array(4) as _}
      <div class="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex items-start gap-3">
        <div class="w-9 h-9 bg-gray-100 rounded-xl shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-100 rounded w-2/5"></div>
          <div class="h-2.5 bg-gray-100 rounded w-4/5"></div>
        </div>
      </div>
    {/each}
  {:else if notifications.length === 0}
    <div class="py-20 text-center">
      <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Bell size={22} class="text-gray-400" />
      </div>
      <p class="text-sm font-semibold text-gray-700">Tidak ada notifikasi</p>
      <p class="text-xs text-gray-400 mt-1">Pemberitahuan persetujuan akan muncul di sini</p>
    </div>
  {:else}
    {#each notifications as notif}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div
        onclick={() => markRead(notif.id)}
        class="bg-white border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all group
          {notif.is_read ? 'border-gray-100' : 'border-indigo-200 bg-indigo-50/30'}"
      >
        <!-- Icon -->
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5
          {notif.type === 'success' || notif.type === 'info'
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-600'}"
        >
          {#if notif.type === 'success' || notif.type === 'info'}
            <CheckCircle size={16} />
          {:else}
            <XCircle size={16} />
          {/if}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-gray-900 leading-snug">{notif.title}</p>
          <p class="text-[12px] text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
          <p class="text-[11px] text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString('id-ID')}</p>
        </div>

        <!-- Unread dot + delete -->
        <div class="flex flex-col items-center gap-2 shrink-0">
          {#if !notif.is_read}
            <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
          {/if}
          <button
            onclick={(e) => deleteNotif(e, notif.id)}
            class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    {/each}
  {/if}
</div>
