<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api";
  import { ArrowLeft, Clock, CheckCircle, XCircle, Package, User, Truck } from "@lucide/svelte";
  import Modal from "$lib/components/Modal.svelte";
  import FormInput from "$lib/components/FormInput.svelte";
  import { onMount } from "svelte";

  let id = $derived($page.params.id);
  let requestData = $state<any>(null);
  let isLoading = $state(true);

  // DO Modal State
  let showDoModal = $state(false);
  let isSubmittingDo = $state(false);
  let doData = $state({ driver_name: "", license_plate: "", notes: "" });

  onMount(async () => {
    try {
      requestData = await api.get(`/requests/${id}`);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat detail permintaan.");
    } finally {
      isLoading = false;
    }
  });

  async function updateStatus(status: string) {
    try {
      await api.put(`/requests/${id}/status`, { status, admin_note: "Ditinjau admin" });
      requestData = await api.get(`/requests/${id}`);
    } catch (e: any) { alert(e.message || "Gagal memperbarui status."); }
  }

  async function createDeliveryOrder() {
    isSubmittingDo = true;
    try {
      const res = await api.post('/delivery-orders', {
        inventory_request_id: requestData.id,
        driver_name: doData.driver_name,
        license_plate: doData.license_plate,
        notes: doData.notes
      });
      showDoModal = false;
      alert("Surat Jalan berhasil dibuat!");
      goto("/admin/delivery-orders");
    } catch (e: any) {
      alert(e.message || "Gagal membuat surat jalan.");
    } finally {
      isSubmittingDo = false;
    }
  }

  function statusLabel(s: string) {
    if (s === "pending")   return { label: "Menunggu",  cls: "badge-amber", icon: Clock };
    if (s === "rejected")  return { label: "Ditolak",   cls: "badge-red",   icon: XCircle };
    if (s === "processed" || s === "ready") return { label: "Diproses",  cls: "badge-indigo",icon: CheckCircle };
    return { label: "Selesai", cls: "badge-green", icon: CheckCircle };
  }
</script>

<svelte:head>
  <title>Detail Permintaan | Khwarizmi Inventory</title>
</svelte:head>

<div class="space-y-5 max-w-4xl">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <a href="/admin/approvals" class="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
      <ArrowLeft size={20} />
    </a>
    <div>
      <h1 class="text-[20px] font-bold text-gray-900">Detail Permintaan</h1>
      <p class="text-[13px] text-gray-500">Tinjau rincian barang yang diajukan</p>
    </div>
  </div>

  {#if isLoading}
    <div class="card p-8 animate-pulse space-y-4">
      <div class="h-4 bg-gray-100 rounded w-1/4"></div>
      <div class="h-10 bg-gray-100 rounded w-full"></div>
      <div class="h-10 bg-gray-100 rounded w-full"></div>
    </div>
  {:else if requestData}
    {@const st = statusLabel(requestData.status)}
    
    <!-- Top Info -->
    <div class="card p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div>
        <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID Request</p>
        <p class="text-[15px] font-bold text-indigo-600 mt-1">{requestData.request_number}</p>
      </div>
      <div>
        <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tanggal</p>
        <p class="text-[14px] font-medium text-gray-900 mt-1">
          {new Date(requestData.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div>
        <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
        <span class="badge {st.cls} inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px]">
          <st.icon size={13} />
          {st.label}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Left: Items -->
      <div class="md:col-span-2 space-y-5">
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 class="text-[14px] font-semibold text-gray-800">Daftar Barang</h2>
          </div>
          <div class="divide-y divide-gray-50">
            {#each requestData.items as reqItem}
              <div class="px-5 py-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <Package size={18} class="text-gray-400" />
                  </div>
                  <div>
                    <p class="text-[14px] font-semibold text-gray-900">{reqItem.item.name}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">Kode: {reqItem.item.code} &bull; Stok Gudang: {reqItem.item.stock} {reqItem.item.unit}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[16px] font-bold text-gray-900">{reqItem.quantity}</p>
                  <p class="text-[11px] text-gray-400">{reqItem.item.unit}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>

        {#if requestData.notes}
          <div class="card p-5 bg-amber-50/30 border-amber-100/50">
            <h3 class="text-[12px] font-semibold text-amber-800 mb-2">Catatan Pemohon:</h3>
            <p class="text-[13px] text-amber-700 leading-relaxed">{requestData.notes}</p>
          </div>
        {/if}
      </div>

      <!-- Right: User & Actions -->
      <div class="space-y-5">
        <!-- User Info -->
        <div class="card p-5">
          <h2 class="text-[13px] font-semibold text-gray-800 mb-4">Pemohon</h2>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center font-bold">
              {requestData.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="text-[14px] font-semibold text-gray-900">{requestData.user?.name}</p>
              <p class="text-[12px] text-gray-500 mt-0.5">{requestData.user?.email}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card p-5">
          <h2 class="text-[13px] font-semibold text-gray-800 mb-4">Tindakan</h2>
          <div class="space-y-2">
            {#if requestData.status === 'pending'}
              <button
                onclick={() => updateStatus("processed")}
                class="w-full btn bg-indigo-600 hover:bg-indigo-700 text-white flex justify-center py-2.5"
              >
                <CheckCircle size={16} class="mr-2" /> Setujui & Proses
              </button>
              <button
                onclick={() => updateStatus("rejected")}
                class="w-full btn bg-white border border-red-200 text-red-600 hover:bg-red-50 flex justify-center py-2.5"
              >
                <XCircle size={16} class="mr-2" /> Tolak Permintaan
              </button>
            {:else if requestData.status === 'processed' || requestData.status === 'ready'}
              <button
                onclick={() => (showDoModal = true)}
                class="w-full btn bg-gray-900 hover:bg-gray-800 text-white flex justify-center py-2.5"
              >
                <Truck size={16} class="mr-2" /> Buat Surat Jalan
              </button>
            {:else}
              <p class="text-[12px] text-gray-500 text-center py-2">Tidak ada tindakan tersedia.</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Modal Surat Jalan -->
<Modal bind:show={showDoModal} title="Buat Surat Jalan (Delivery Order)">
  <div class="space-y-4">
    <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-2">
      <p class="text-[12px] text-indigo-700 font-medium leading-relaxed">
        Membuat surat jalan akan menandai permintaan ini sebagai selesai dan <strong>stok barang di gudang akan otomatis dipotong</strong>.
      </p>
    </div>
    
    <FormInput 
      label="Nama Sopir/Kurir" 
      placeholder="Contoh: Budi Santoso" 
      bind:value={doData.driver_name} 
      required 
    />
    <FormInput 
      label="Plat Nomor Kendaraan" 
      placeholder="Contoh: B 1234 CD" 
      bind:value={doData.license_plate} 
      required 
    />
    <FormInput 
      label="Catatan Pengiriman" 
      placeholder="Opsional..." 
      bind:value={doData.notes} 
    />
  </div>

  {#snippet footer()}
    <button onclick={() => (showDoModal = false)} class="btn btn-ghost text-sm" disabled={isSubmittingDo}>Batal</button>
    <button onclick={createDeliveryOrder} class="btn btn-primary text-sm" disabled={isSubmittingDo || !doData.driver_name || !doData.license_plate}>
      {isSubmittingDo ? "Memproses..." : "Buat Surat Jalan"}
    </button>
  {/snippet}
</Modal>
