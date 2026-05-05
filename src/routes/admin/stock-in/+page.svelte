<script lang="ts">
  import { ArrowDownToLine, Plus, Search, Calendar } from "@lucide/svelte";
  import Table from "$lib/components/Table.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import FormInput from "$lib/components/FormInput.svelte";

  // State Data Riwayat Barang Masuk (Mock Data)
  let stockInHistory = $state([
    { id: 1, date: "21 Feb 2026", item_name: "Laptop Asus ROG", supplier: "PT. Teknologi Global", qty: 10, receiver: "Admin Utama" },
    { id: 2, date: "20 Feb 2026", item_name: "Kabel UTP Cat 6", supplier: "Toko Elektronik Jaya", qty: 50, receiver: "Staff Gudang" },
  ]);

  // Data Master Barang (Untuk pilihan di dropdown form)
  const availableItems = [
    { value: "BRG-001", label: "Laptop Asus ROG" },
    { value: "BRG-002", label: "Kabel UTP Cat 6" },
    { value: "BRG-003", label: "Router Mikrotik" },
  ];

  let searchQuery = $state("");
  let isModalOpen = $state(false);

  // Form State
  const defaultForm = { item_code: "", supplier: "", qty: 1, notes: "" };
  let formData = $state({ ...defaultForm });

  // Derived State untuk Pencarian
  let filteredHistory = $derived(stockInHistory.filter((record) => record.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || record.supplier.toLowerCase().includes(searchQuery.toLowerCase())));

  // Konfigurasi Kolom Tabel
  const columns = [
    { label: "Tanggal", key: "date" },
    { label: "Nama Barang", key: "item_name" },
    { label: "Supplier", key: "supplier" },
    { label: "Jumlah (Qty)", key: "qty" },
    { label: "Penerima", key: "receiver" },
  ];

  function openAddModal() {
    formData = { ...defaultForm };
    isModalOpen = true;
  }

  function saveStockIn() {
    // Logika sederhana menambah ke paling atas (unshift)
    const newItemName = availableItems.find((i) => i.value === formData.item_code)?.label || "Barang Tidak Diketahui";

    const newRecord = {
      id: Date.now(),
      date: "21 Feb 2026", // Idealnya pakai format tanggal otomatis
      item_name: newItemName,
      supplier: formData.supplier,
      qty: formData.qty,
      receiver: "Admin Utama", // Sesuai user yang login
    };

    stockInHistory = [newRecord, ...stockInHistory];
    isModalOpen = false;
  }

  // Untuk Stock In, biasanya data tidak boleh dihapus sembarangan demi audit trail
  // Tapi kita sediakan dummy function jika dibutuhkan fitur pembatalan
  function cancelStockIn(record: any) {
    alert(`Fitur pembatalan untuk ${record.item_name} akan memerlukan otorisasi Manager.`);
  }
</script>

<svelte:head>
  <title>Stock Masuk | Khwarizmi Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
        <ArrowDownToLine size={24} />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Catat Stock Masuk</h1>
        <p class="text-sm text-slate-500">Rekap data barang yang baru tiba dari supplier.</p>
      </div>
    </div>

    <button onclick={openAddModal} class="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-emerald-500/30">
      <Plus size={20} />
      Input Barang Masuk
    </button>
  </div>

  <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
    <div class="relative flex-1 w-full max-w-md">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} class="text-slate-400" />
      </div>
      <input type="text" bind:value={searchQuery} class="block w-full pl-11 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-0 text-sm transition-all" placeholder="Cari nama barang atau supplier..." />
    </div>

    <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 w-full sm:w-auto">
      <Calendar size={16} />
      Bulan Ini
    </button>
  </div>

  <Table {columns} data={filteredHistory} onEdit={() => {}} onDelete={cancelStockIn} emptyMessage="Belum ada riwayat barang masuk." />
</div>

<Modal bind:show={isModalOpen} title="Form Input Barang Masuk">
  <div class="space-y-4">
    <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
      <div class="mt-0.5">ℹ️</div>
      <p>Pastikan jumlah fisik barang sesuai dengan surat jalan dari supplier sebelum menyimpan data.</p>
    </div>

    <FormInput label="Pilih Barang" type="select" options={availableItems} bind:value={formData.item_code} required />

    <FormInput label="Nama Supplier" placeholder="Contoh: PT. Sumber Makmur" bind:value={formData.supplier} required />

    <div class="grid grid-cols-2 gap-4">
      <FormInput label="Jumlah (Qty)" type="number" bind:value={formData.qty} required />
      <FormInput label="Tanggal Masuk" type="text" value="21 Feb 2026" disabled />
    </div>

    <div class="flex flex-col gap-1.5 mb-4">
      <label for="notes" class="text-sm font-semibold text-slate-700">Catatan / No. Surat Jalan (Opsional)</label>
      <textarea
        id="notes"
        bind:value={formData.notes}
        rows="3"
        placeholder="Tuliskan nomor referensi atau kondisi barang..."
        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700 resize-none"
      ></textarea>
    </div>
  </div>

  {#snippet footer()}
    <button onclick={() => (isModalOpen = false)} class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors"> Batal </button>
    <button onclick={saveStockIn} class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm"> Simpan & Update Stok </button>
  {/snippet}
</Modal>
