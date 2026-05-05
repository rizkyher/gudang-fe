<script lang="ts">
  import { RotateCcw, Plus, Search, ClipboardList, CheckCircle, XCircle, AlertCircle } from "@lucide/svelte";
  import Table from "$lib/components/Table.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import FormInput from "$lib/components/FormInput.svelte";

  // State Data Return Barang
  let returns = $state([
    { id: 1, ret_number: "RET-2602-001", ref_do: "DO-2602-001", customer: "PT. Maju Mundur", item: "Laptop Asus ROG", qty: 1, reason: "Layar Cacat", status: "Selesai" },
    { id: 2, ret_number: "RET-2602-002", ref_do: "DO-2602-003", customer: "Universitas Khwarizmi", item: "Kabel UTP Cat 6", qty: 2, reason: "Salah Tipe", status: "Pending Pengecekan" },
  ]);

  let searchQuery = $state("");
  let isModalOpen = $state(false);

  // Form State
  const defaultForm = { ref_do: "", item: "", qty: 1, reason: "", notes: "" };
  let formData = $state({ ...defaultForm });

  // Pilihan Alasan Retur
  const reasonOptions = [
    { value: "Rusak Fisik", label: "Rusak Fisik / Cacat Pabrik" },
    { value: "Salah Kirim", label: "Salah Barang / Tipe" },
    { value: "Kelebihan", label: "Kelebihan Pengiriman" },
    { value: "Lainnya", label: "Lainnya (Tulis di catatan)" },
  ];

  // Filter Pencarian Dinamis
  let filteredReturns = $derived(
    returns.filter((ret) => ret.ret_number.toLowerCase().includes(searchQuery.toLowerCase()) || ret.ref_do.toLowerCase().includes(searchQuery.toLowerCase()) || ret.customer.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Manipulasi Data Tabel untuk menampilkan Badge Status
  let tableData = $derived(
    filteredReturns.map((item) => ({
      ...item,
      status_badge: item.status === "Selesai" ? "🟢 Selesai" : item.status === "Ditolak" ? "🔴 Ditolak" : "🟣 Pending",
    })),
  );

  const columns = [
    { label: "No. Retur", key: "ret_number" },
    { label: "Ref. DO", key: "ref_do" },
    { label: "Pelanggan", key: "customer" },
    { label: "Barang", key: "item" },
    { label: "Qty", key: "qty" },
    { label: "Alasan", key: "reason" },
    { label: "Status", key: "status_badge" },
  ];

  function openAddModal() {
    formData = { ...defaultForm };
    isModalOpen = true;
  }

  function saveReturn() {
    const newReturn = {
      id: Date.now(),
      ret_number: `RET-2602-00${returns.length + 1}`,
      ref_do: formData.ref_do || "Tanpa Referensi",
      customer: "Data dari DO", // Idealnya ditarik otomatis dari No. DO
      item: formData.item || "Barang Manual",
      qty: formData.qty,
      reason: formData.reason,
      status: "Pending Pengecekan",
    };
    returns = [newReturn, ...returns];
    isModalOpen = false;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
        <RotateCcw size={24} />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Return Barang</h1>
        <p class="text-sm text-slate-500">Kelola pengembalian barang bermasalah dari pelanggan.</p>
      </div>
    </div>

    <button onclick={openAddModal} class="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-violet-500/30">
      <Plus size={20} />
      Catat Retur Baru
    </button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div class="p-2 bg-violet-50 text-violet-600 rounded-lg">
        <ClipboardList size={24} />
      </div>
      <div>
        <p class="text-sm text-slate-500 font-medium">Perlu Dicek</p>
        <p class="text-xl font-bold text-slate-800">1</p>
      </div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
        <CheckCircle size={24} />
      </div>
      <div>
        <p class="text-sm text-slate-500 font-medium">Retur Selesai</p>
        <p class="text-xl font-bold text-slate-800">1</p>
      </div>
    </div>
    <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div class="p-2 bg-rose-50 text-rose-600 rounded-lg">
        <XCircle size={24} />
      </div>
      <div>
        <p class="text-sm text-slate-500 font-medium">Retur Ditolak</p>
        <p class="text-xl font-bold text-slate-800">0</p>
      </div>
    </div>
  </div>

  <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div class="relative flex-1 w-full max-w-md">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} class="text-slate-400" />
      </div>
      <input type="text" bind:value={searchQuery} class="block w-full pl-11 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-0 text-sm transition-all" placeholder="Cari No. Retur, DO, atau Pelanggan..." />
    </div>
  </div>

  <Table {columns} data={tableData} onEdit={() => {}} onDelete={() => {}} emptyMessage="Belum ada data pengembalian barang." />
</div>

<Modal bind:show={isModalOpen} title="Formulir Return Barang">
  <div class="space-y-4">
    <div class="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-800 flex items-start gap-3">
      <AlertCircle size={18} class="mt-0.5 shrink-0" />
      <p>Pastikan Anda memasukkan Nomor Delivery Order (DO) agar sistem bisa memverifikasi riwayat pengiriman barang tersebut.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput label="No. Referensi DO" placeholder="Contoh: DO-2602-003" bind:value={formData.ref_do} required />
      <FormInput label="Jumlah Dikembalikan (Qty)" type="number" bind:value={formData.qty} required />
    </div>

    <FormInput label="Nama Barang" placeholder="Ketik nama barang yang diretur" bind:value={formData.item} required />

    <FormInput label="Alasan Pengembalian" type="select" options={reasonOptions} bind:value={formData.reason} required />

    <div class="flex flex-col gap-1.5 mb-4">
      <label class="text-sm font-semibold text-slate-700">Catatan Kondisi Barang</label>
      <textarea
        bind:value={formData.notes}
        rows="3"
        placeholder="Deskripsikan kerusakan atau masalah pada barang..."
        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
      ></textarea>
    </div>
  </div>

  {#snippet footer()}
    <button onclick={() => (isModalOpen = false)} class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors"> Batal </button>
    <button onclick={saveReturn} class="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors shadow-sm"> Simpan Data Retur </button>
  {/snippet}
</Modal>
