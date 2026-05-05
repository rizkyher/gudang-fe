<script lang="ts">
  import { Plus, Search } from "@lucide/svelte";
  import Table from "$lib/components/Table.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import FormInput from "$lib/components/FormInput.svelte";
  import { api } from "$lib/api";
  import { onMount } from "svelte";

  let items      = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let isLoading  = $state(true);
  let isSaving   = $state(false);
  let searchQuery = $state("");
  let isModalOpen = $state(false);
  let isEditing   = $state(false);

  const defaultForm = { id: null, code: "", name: "", category_id: "", stock: 0, unit: "" };
  let formData = $state({ ...defaultForm });

  let categoryOptions = $derived(categories.map(c => ({ value: String(c.id), label: c.name })));

  let filteredItems = $derived(
    items.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(i => ({
      ...i,
      category_name: i.category?.name ?? "—",
      stock_display: `${i.stock} ${i.unit}`,
    }))
  );

  const columns = [
    { label: "Kode",     key: "code"          },
    { label: "Nama Barang", key: "name"       },
    { label: "Kategori", key: "category_name" },
    { label: "Stok",     key: "stock_display" },
  ];

  onMount(async () => {
    await refreshData();
  });

  async function refreshData() {
    isLoading = true;
    try {
      [items, categories] = await Promise.all([api.get('/items'), api.get('/categories')]);
    } catch (e) { console.error(e); }
    finally { isLoading = false; }
  }

  function openAddModal() {
    isEditing = false;
    formData  = { ...defaultForm };
    isModalOpen = true;
  }

  function openEditModal(item: any) {
    isEditing = true;
    formData  = { ...item, category_id: String(item.category_id) };
    isModalOpen = true;
  }

  async function saveItem() {
    isSaving = true;
    try {
      if (isEditing) { await api.put(`/items/${formData.id}`, formData); }
      else           { await api.post('/items', formData); }
      await refreshData();
      isModalOpen = false;
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan barang.");
    } finally { isSaving = false; }
  }

  async function deleteItem(item: any) {
    if (!confirm(`Hapus "${item.name}"?`)) return;
    try {
      await api.delete(`/items/${item.id}`);
      await refreshData();
    } catch { alert("Gagal menghapus barang."); }
  }
</script>

<svelte:head>
  <title>Master Barang | Khwarizmi Inventory</title>
</svelte:head>

<div class="space-y-5">
  <!-- Header -->
  <div class="flex items-end justify-between">
    <div class="page-header">
      <h1>Master Barang</h1>
      <p>{isLoading ? "Memuat..." : `${filteredItems.length} barang ditemukan`}</p>
    </div>
    <button onclick={openAddModal} class="btn btn-primary text-sm">
      <Plus size={15} />
      Tambah Barang
    </button>
  </div>

  <!-- Search -->
  <div class="relative max-w-sm">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Search size={15} class="text-gray-400" />
    </div>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Cari kode atau nama barang..."
      class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15 transition-all"
    />
  </div>

  <!-- Table -->
  <Table
    {columns}
    data={filteredItems}
    {isLoading}
    onEdit={openEditModal}
    onDelete={deleteItem}
    emptyMessage="Belum ada barang. Klik 'Tambah Barang' untuk memulai."
  />
</div>

<!-- Modal -->
<Modal bind:show={isModalOpen} title={isEditing ? "Edit Barang" : "Tambah Barang"}>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <FormInput label="Kode Barang" placeholder="BRG-001" bind:value={formData.code} required />
      <FormInput label="Kategori" type="select" options={categoryOptions} bind:value={formData.category_id} required />
    </div>
    <FormInput label="Nama Barang" placeholder="Contoh: Kertas HVS A4" bind:value={formData.name} required />
    <div class="grid grid-cols-2 gap-4">
      <FormInput label="Stok" type="number" bind:value={formData.stock} required />
      <FormInput label="Satuan" placeholder="pcs / rim / box" bind:value={formData.unit} required />
    </div>
  </div>

  {#snippet footer()}
    <button onclick={() => (isModalOpen = false)} class="btn btn-ghost text-sm" disabled={isSaving}>Batal</button>
    <button onclick={saveItem} class="btn btn-primary text-sm" disabled={isSaving}>
      {isSaving ? "Menyimpan..." : "Simpan"}
    </button>
  {/snippet}
</Modal>
