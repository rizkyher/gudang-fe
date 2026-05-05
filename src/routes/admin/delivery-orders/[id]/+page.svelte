<script lang="ts">
  import { page } from "$app/stores";
  import { api } from "$lib/api";
  import { ArrowLeft, Printer, Truck, Package, Calendar, User } from "@lucide/svelte";
  import { onMount } from "svelte";

  let id = $derived($page.params.id);
  let doData = $state<any>(null);
  let isLoading = $state(true);

  onMount(async () => {
    try {
      doData = await api.get(`/delivery-orders/${id}`);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat detail surat jalan.");
    } finally {
      isLoading = false;
    }
  });

  function handlePrint() {
    window.print();
  }
</script>

<svelte:head>
  <title>Cetak Surat Jalan | Khwarizmi Inventory</title>
</svelte:head>

<div class="space-y-5 max-w-4xl mx-auto print-container">
  <!-- Header (Screen Only) -->
  <div class="flex items-center justify-between no-print">
    <div class="flex items-center gap-4">
      <a href="/admin/delivery-orders" class="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
        <ArrowLeft size={20} />
      </a>
      <div>
        <h1 class="text-[20px] font-bold text-gray-900">Detail Surat Jalan</h1>
        <p class="text-[13px] text-gray-500">Tinjau dan cetak dokumen pengiriman</p>
      </div>
    </div>
    <button onclick={handlePrint} class="btn btn-primary text-sm flex items-center gap-2">
      <Printer size={16} /> Cetak Dokumen
    </button>
  </div>

  {#if isLoading}
    <div class="card p-8 animate-pulse space-y-4 no-print">
      <div class="h-8 bg-gray-100 rounded w-1/3"></div>
      <div class="h-32 bg-gray-100 rounded w-full"></div>
    </div>
  {:else if doData}
    {@const items = doData.inventory_request?.items || []}
    {@const req = doData.inventory_request}

    <!-- Printable Area -->
    <div class="bg-white border border-gray-200 print:border-none rounded-xl p-8 print:p-0 text-gray-900 shadow-sm print:shadow-none">
      <!-- Kop Surat (Header) -->
      <div class="flex items-start justify-between border-b-2 border-gray-900 pb-6 mb-6">
        <div>
          <h1 class="text-2xl font-black tracking-tight uppercase">Surat Jalan</h1>
          <p class="text-sm font-semibold text-gray-600 mt-1">Khwarizmi Academy</p>
          <p class="text-[11px] text-gray-500 mt-0.5">Jl. Pendidikan No. 1, Jakarta Selatan</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Nomor DO</p>
          <p class="text-xl font-bold text-gray-900">{doData.do_number}</p>
          <p class="text-[11px] text-gray-500 mt-1">ID Ref: {req?.request_number}</p>
        </div>
      </div>

      <!-- Info Pengiriman -->
      <div class="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Tujuan / Penerima</p>
          <p class="text-[14px] font-bold">{req?.user?.name ?? "—"}</p>
          <p class="text-[12px] text-gray-600 mt-0.5">{req?.user?.email ?? "—"}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Informasi Kurir</p>
          <p class="text-[13px] font-semibold">Sopir: <span class="font-normal">{doData.driver_name}</span></p>
          <p class="text-[13px] font-semibold mt-0.5">Plat Kendaraan: <span class="font-normal">{doData.license_plate}</span></p>
          <p class="text-[13px] font-semibold mt-0.5">Tanggal: <span class="font-normal">{new Date(doData.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></p>
        </div>
      </div>

      <!-- Tabel Barang -->
      <div class="mb-8 border border-gray-900 rounded-lg overflow-hidden">
        <table class="w-full text-left text-[12px]">
          <thead class="bg-gray-50 border-b border-gray-900">
            <tr>
              <th class="py-2.5 px-4 font-bold border-r border-gray-200 w-12 text-center">No</th>
              <th class="py-2.5 px-4 font-bold border-r border-gray-200">Kode Barang</th>
              <th class="py-2.5 px-4 font-bold border-r border-gray-200">Nama Barang</th>
              <th class="py-2.5 px-4 font-bold border-r border-gray-200 text-center w-24">Jumlah</th>
              <th class="py-2.5 px-4 font-bold text-center w-32">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {#each items as reqItem, i}
              <tr class="border-b border-gray-200 last:border-0">
                <td class="py-3 px-4 border-r border-gray-200 text-center">{i + 1}</td>
                <td class="py-3 px-4 border-r border-gray-200 font-medium">{reqItem.item.code}</td>
                <td class="py-3 px-4 border-r border-gray-200 font-semibold">{reqItem.item.name}</td>
                <td class="py-3 px-4 border-r border-gray-200 text-center font-bold">
                  {reqItem.quantity} <span class="text-gray-500 font-normal">{reqItem.item.unit}</span>
                </td>
                <td class="py-3 px-4 text-center text-gray-400">..................</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if doData.notes}
        <div class="mb-10">
          <p class="text-[11px] font-bold uppercase mb-1">Catatan Pengiriman:</p>
          <p class="text-[12px] italic border-l-2 border-gray-300 pl-3 py-1">{doData.notes}</p>
        </div>
      {/if}

      <!-- Tanda Tangan -->
      <div class="grid grid-cols-3 gap-8 text-center pt-8">
        <div>
          <p class="text-[12px] font-medium mb-16">Penerima,</p>
          <p class="text-[13px] font-bold border-b border-gray-400 inline-block px-4">{req?.user?.name ?? "(..............................)"}</p>
        </div>
        <div>
          <p class="text-[12px] font-medium mb-16">Sopir / Kurir,</p>
          <p class="text-[13px] font-bold border-b border-gray-400 inline-block px-4">{doData.driver_name ?? "(..............................)"}</p>
        </div>
        <div>
          <p class="text-[12px] font-medium mb-16">Kepala Gudang,</p>
          <p class="text-[13px] font-bold border-b border-gray-400 inline-block px-4">(..............................)</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @media print {
    @page { margin: 0.5cm; }
    :global(body) {
      background-color: white !important;
      -webkit-print-color-adjust: exact;
    }
    :global(aside), :global(nav), :global(header), .no-print {
      display: none !important;
    }
    :global(.h-screen), :global(main), :global(body), :global(html) {
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
    }
    :global(.p-4), :global(.sm\:p-6) {
      padding: 0 !important;
    }
    .print-container {
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
</style>
