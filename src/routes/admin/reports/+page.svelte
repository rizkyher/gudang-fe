<script lang="ts">
  import { FileBarChart, Download, Calendar, PackageSearch, TrendingUp, TrendingDown, Save } from "@lucide/svelte";
  import Table from "$lib/components/Table.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import FormInput from "$lib/components/FormInput.svelte";

  // State untuk navigasi Tab
  let activeTab = $state("stock"); // Pilihan: 'stock', 'in', 'out'

  // State untuk Filter Tanggal
  let startDate = $state("2026-02-01");
  let endDate = $state("2026-02-21");

  // --- MOCK DATA (Sekarang menggunakan $state agar reaktif saat diedit) ---
  let stockData = $state([
    { id: 1, code: "BRG-001", name: "Laptop Asus ROG", initial: 10, in: 5, out: 0, final: 15, status: "Aman" },
    { id: 2, code: "BRG-002", name: "Kabel UTP Cat 6", initial: 100, in: 50, out: 30, final: 120, status: "Aman" },
    { id: 3, code: "BRG-003", name: "Router Mikrotik", initial: 5, in: 0, out: 3, final: 2, status: "Kritis" },
  ]);

  let transactionInData = $state([
    { id: 1, date: "21 Feb 2026", ref: "INV-202602-01", supplier: "PT. Teknologi Global", items_count: 50, user: "Admin" },
    { id: 2, date: "20 Feb 2026", ref: "INV-202602-02", supplier: "Toko Elektronik Jaya", items_count: 10, user: "Staff" },
  ]);

  let transactionOutData = $state([
    { id: 1, date: "21 Feb 2026", ref: "DO-2602-001", customer: "PT. Maju Mundur", items_count: 3, user: "Admin" },
    { id: 2, date: "20 Feb 2026", ref: "DO-2602-003", customer: "Universitas Khwarizmi", items_count: 5, user: "Admin" },
  ]);

  // --- STATE UNTUK EDIT ---
  let isEditModalOpen = $state(false);
  let formData: any = $state({});
  let editingId: number | null = $state(null);

  // Konfigurasi Kolom Dinamis berdasarkan Tab Aktif
  let currentColumns = $derived.by(() => {
    if (activeTab === "stock")
      return [
        { label: "Kode", key: "code" },
        { label: "Nama Barang", key: "name" },
        { label: "Stok Awal", key: "initial" },
        { label: "Masuk", key: "in" },
        { label: "Keluar", key: "out" },
        { label: "Stok Akhir", key: "final" },
      ];
    if (activeTab === "in")
      return [
        { label: "Tanggal", key: "date" },
        { label: "No. Referensi", key: "ref" },
        { label: "Supplier", key: "supplier" },
        { label: "Total Qty", key: "items_count" },
        { label: "Diinput Oleh", key: "user" },
      ];
    return [
      { label: "Tanggal", key: "date" },
      { label: "No. DO", key: "ref" },
      { label: "Pelanggan", key: "customer" },
      { label: "Total Qty", key: "items_count" },
      { label: "Diproses Oleh", key: "user" },
    ];
  });

  // Data Dinamis berdasarkan Tab Aktif
  let currentData = $derived.by(() => {
    if (activeTab === "stock") return stockData;
    if (activeTab === "in") return transactionInData;
    return transactionOutData;
  });

  // Judul Laporan Dinamis
  let reportTitle = $derived.by(() => {
    if (activeTab === "stock") return "Data Rekapitulasi Stok Gudang";
    if (activeTab === "in") return "Data Transaksi Penerimaan Barang Masuk";
    return "Data Transaksi Pengiriman Barang Keluar (DO)";
  });

  // --- FUNGSI EDIT & SIMPAN ---
  function openEditModal(row: any) {
    editingId = row.id;
    formData = { ...row }; // Copy data baris yang diklik
    isEditModalOpen = true;
  }

  function saveEdit() {
    if (activeTab === "stock") {
      // Logic: Update Stok Akhir otomatis jika In/Out berubah
      formData.final = formData.initial + formData.in - formData.out;
      formData.status = formData.final <= 5 ? "Kritis" : "Aman";

      const index = stockData.findIndex((item) => item.id === editingId);
      if (index !== -1) stockData[index] = { ...formData };
    } else if (activeTab === "in") {
      const index = transactionInData.findIndex((item) => item.id === editingId);
      if (index !== -1) transactionInData[index] = { ...formData };
    } else if (activeTab === "out") {
      const index = transactionOutData.findIndex((item) => item.id === editingId);
      if (index !== -1) transactionOutData[index] = { ...formData };
    }

    isEditModalOpen = false;
  }

  // --- FUNGSI CETAK ---
  function handleExport() {
    window.print();
  }
</script>

<svelte:head>
  <style>
    @media print {
      @page {
        size: A4 landscape;
        margin: 15mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background-color: white !important;
      }
      body * {
        visibility: hidden;
      }
      #printable-report,
      #printable-report * {
        visibility: visible;
      }
      #printable-report {
        display: block !important;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
      }
    }
  </style>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-md">
        <FileBarChart size={24} />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Pusat Laporan</h1>
        <p class="text-sm text-slate-500">Pantau pergerakan stok dan riwayat transaksi secara lengkap.</p>
      </div>
    </div>

    <button onclick={handleExport} class="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
      <Download size={20} /> Cetak / Save PDF
    </button>
  </div>

  <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 no-print">
    <div class="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
      <button
        onclick={() => (activeTab = "stock")}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors {activeTab === 'stock' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}"
      >
        <PackageSearch size={18} /> Laporan Stok
      </button>
      <button
        onclick={() => (activeTab = "in")}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors {activeTab === 'in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'}"
      >
        <TrendingDown size={18} /> Barang Masuk
      </button>
      <button
        onclick={() => (activeTab = "out")}
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors {activeTab === 'out' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-500 hover:bg-slate-50'}"
      >
        <TrendingUp size={18} /> Barang Keluar
      </button>
    </div>

    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Calendar size={18} class="text-slate-400" /> <span>Periode:</span>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <input type="date" bind:value={startDate} class="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto" />
        <span class="text-slate-400">-</span>
        <input type="date" bind:value={endDate} class="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto" />
      </div>
    </div>
  </div>

  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
    <div class="p-4 bg-slate-50 border-b border-slate-200">
      <h3 class="font-bold text-slate-800">{reportTitle}</h3>
      <p class="text-xs text-slate-500 mt-1">Menampilkan data dari {startDate} hingga {endDate}</p>
    </div>

    <Table columns={currentColumns} data={currentData} onEdit={openEditModal} onDelete={() => {}} emptyMessage="Tidak ada data pada periode ini." />
  </div>
</div>

<Modal bind:show={isEditModalOpen} title="Koreksi Data Laporan">
  <div class="space-y-4 p-1">
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
      <strong>Catatan Admin:</strong> Edit data dari halaman laporan sebaiknya hanya dilakukan untuk penyesuaian (Stock Opname) darurat.
    </div>

    {#if activeTab === "stock"}
      <FormInput label="Kode Barang" bind:value={formData.code} disabled />
      <FormInput label="Nama Barang" bind:value={formData.name} />
      <div class="grid grid-cols-3 gap-4">
        <FormInput label="Stok Awal" type="number" bind:value={formData.initial} />
        <FormInput label="Total Masuk" type="number" bind:value={formData.in} />
        <FormInput label="Total Keluar" type="number" bind:value={formData.out} />
      </div>
      <p class="text-xs text-slate-500 mt-1">*Stok akhir akan dihitung otomatis saat disimpan.</p>
    {:else if activeTab === "in"}
      <div class="grid grid-cols-2 gap-4">
        <FormInput label="No. Referensi" bind:value={formData.ref} />
        <FormInput label="Tanggal Masuk" bind:value={formData.date} />
      </div>
      <FormInput label="Nama Supplier" bind:value={formData.supplier} />
      <div class="grid grid-cols-2 gap-4">
        <FormInput label="Total Qty Masuk" type="number" bind:value={formData.items_count} />
        <FormInput label="Diinput Oleh" bind:value={formData.user} />
      </div>
    {:else if activeTab === "out"}
      <div class="grid grid-cols-2 gap-4">
        <FormInput label="No. DO / Ref" bind:value={formData.ref} />
        <FormInput label="Tanggal Keluar" bind:value={formData.date} />
      </div>
      <FormInput label="Pelanggan Tujuan" bind:value={formData.customer} />
      <div class="grid grid-cols-2 gap-4">
        <FormInput label="Total Qty Keluar" type="number" bind:value={formData.items_count} />
        <FormInput label="Diproses Oleh" bind:value={formData.user} />
      </div>
    {/if}
  </div>

  {#snippet footer()}
    <button onclick={() => (isEditModalOpen = false)} class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors"> Batal </button>
    <button onclick={saveEdit} class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-blue-500/30">
      <Save size={18} /> Simpan Perubahan
    </button>
  {/snippet}
</Modal>

<div id="printable-report" class="hidden font-sans text-slate-900 bg-white">
  <div class="flex items-center justify-between border-b-4 border-slate-800 pb-5 mb-8">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 bg-slate-800 text-white flex items-center justify-center font-bold text-4xl rounded-xl print:border-2 print:border-slate-800 print:text-slate-800 print:bg-transparent">K</div>
      <div>
        <h2 class="text-2xl font-black uppercase tracking-widest text-slate-900">Khwarizmi Academy</h2>
        <p class="text-sm font-semibold text-slate-600 tracking-wide mt-0.5">SISTEM LOGISTIK & INVENTARIS</p>
        <p class="text-xs text-slate-500 mt-1">Jl. Teknologi Raya No. 99, Jakarta Selatan 12345</p>
      </div>
    </div>
    <div class="text-right">
      <h1 class="text-2xl font-black text-slate-800 uppercase mb-2">Laporan Resmi</h1>
      <div class="inline-block bg-slate-100 print:border print:border-slate-400 px-4 py-1.5 rounded-lg">
        <p class="font-bold text-slate-800">Periode: {startDate} s/d {endDate}</p>
      </div>
    </div>
  </div>

  <div class="mb-4">
    <h3 class="text-lg font-bold uppercase text-slate-800">{reportTitle}</h3>
  </div>

  <table class="w-full text-left border-collapse text-sm mb-12">
    <thead>
      <tr class="bg-slate-100 border-y-2 border-slate-800">
        <th class="py-3 px-4 font-bold text-center w-12 border-x border-slate-300">No.</th>
        {#each currentColumns as col}
          <th class="py-3 px-4 font-bold border-r border-slate-300">{col.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody class="border-b-2 border-slate-800">
      {#each currentData as row, index}
        <tr class="border-b border-slate-200">
          <td class="py-3 px-4 text-center border-x border-slate-300">{index + 1}</td>
          {#each currentColumns as col}
            <td class="py-3 px-4 border-r border-slate-300">{(row as any)[col.key]}</td>
          {/each}
        </tr>
      {:else}
        <tr class="border-b border-slate-200">
          <td colspan={currentColumns.length + 1} class="py-6 px-4 text-center text-slate-500 border-x border-slate-300 italic">Data laporan kosong pada periode ini.</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="flex justify-end mt-8 text-center text-sm">
    <div class="w-64">
      <p class="font-semibold text-slate-600 mb-20">Jakarta, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Disiapkan Oleh,</p>
      <p class="font-black text-slate-800 underline">Admin Gudang</p>
      <p class="text-xs text-slate-500 mt-1">Khwarizmi Academy</p>
    </div>
  </div>
</div>
