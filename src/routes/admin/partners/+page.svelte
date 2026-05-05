<script lang="ts">
  import { Contact, Plus, Search, Building2, UserSquare, Phone, MapPin } from "@lucide/svelte";
  import Table from "$lib/components/Table.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import FormInput from "$lib/components/FormInput.svelte";

  // State untuk Tab Aktif ('customer' atau 'supplier')
  let activeTab = $state("customer");

  // State Data Mitra
  let partners = $state([
    { id: 1, type: "customer", name: "PT. Maju Mundur", pic: "Bapak Budi", phone: "08123456789", email: "budi@majumundur.com", address: "Jl. Merdeka No. 1, Jakarta" },
    { id: 2, type: "customer", name: "Universitas Khwarizmi", pic: "Ibu Rina", phone: "08987654321", email: "logistik@khwarizmi.ac.id", address: "Kawasan Edukasi Terpadu" },
    { id: 3, type: "supplier", name: "PT. Teknologi Global", pic: "Ko Aseng", phone: "08112233445", email: "sales@tekglobal.com", address: "Mangga Dua Square" },
    { id: 4, type: "supplier", name: "Toko Elektronik Jaya", pic: "Mas Agus", phone: "08776655443", email: "jaya.elektronik@gmail.com", address: "Glodok Makmur" },
  ]);

  let searchQuery = $state("");
  let isModalOpen = $state(false);
  let isEditing = $state(false);

  // Form State
  const defaultForm = { id: 0, type: "customer", name: "", pic: "", phone: "", email: "", address: "" };
  let formData = $state({ ...defaultForm });

  // Derived State: Filter berdasarkan Tab dan Pencarian
  let filteredPartners = $derived(partners.filter((p) => p.type === activeTab && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.pic.toLowerCase().includes(searchQuery.toLowerCase()))));

  // Konfigurasi Kolom
  const columns = [
    { label: "Nama Perusahaan/Toko", key: "name" },
    { label: "Penanggung Jawab (PIC)", key: "pic" },
    { label: "No. Telepon", key: "phone" },
    { label: "Email", key: "email" },
  ];

  function openAddModal() {
    isEditing = false;
    // Set default tipe sesuai tab yang sedang aktif
    formData = { ...defaultForm, type: activeTab };
    isModalOpen = true;
  }

  function openEditModal(partner: any) {
    isEditing = true;
    formData = { ...partner };
    isModalOpen = true;
  }

  function savePartner() {
    if (isEditing) {
      const index = partners.findIndex((p) => p.id === formData.id);
      if (index !== -1) partners[index] = { ...formData };
    } else {
      partners = [{ ...formData, id: Date.now() }, ...partners];
    }
    isModalOpen = false;
  }

  function deletePartner(partner: any) {
    const typeLabel = partner.type === "customer" ? "Pelanggan" : "Supplier";
    if (confirm(`Yakin ingin menghapus ${typeLabel} ${partner.name}?`)) {
      partners = partners.filter((p) => p.id !== partner.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
        <Contact size={24} />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Data Mitra</h1>
        <p class="text-sm text-slate-500">Kelola daftar pelanggan (Customer) dan pemasok (Supplier).</p>
      </div>
    </div>

    <button onclick={openAddModal} class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-indigo-500/30">
      <Plus size={20} />
      Tambah {activeTab === "customer" ? "Pelanggan" : "Supplier"}
    </button>
  </div>

  <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
    <div class="flex p-1 bg-slate-100 rounded-xl max-w-sm">
      <button
        onclick={() => (activeTab = "customer")}
        class="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all
                {activeTab === 'customer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
      >
        <UserSquare size={18} /> Pelanggan
      </button>
      <button
        onclick={() => (activeTab = "supplier")}
        class="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all
                {activeTab === 'supplier' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
      >
        <Building2 size={18} /> Supplier
      </button>
    </div>

    <div class="relative flex-1 max-w-md">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} class="text-slate-400" />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        class="block w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
        placeholder="Cari nama atau PIC..."
      />
    </div>
  </div>

  <Table {columns} data={filteredPartners} onEdit={openEditModal} onDelete={deletePartner} emptyMessage={`Belum ada data ${activeTab === "customer" ? "pelanggan" : "supplier"}.`} />
</div>

<Modal bind:show={isModalOpen} title={isEditing ? "Edit Data Mitra" : "Tambah Mitra Baru"}>
  <div class="space-y-4">
    {#if !isEditing}
      <div class="flex gap-4 mb-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" bind:group={formData.type} value="customer" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
          <span class="text-sm font-medium text-slate-700">Pelanggan (Customer)</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" bind:group={formData.type} value="supplier" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
          <span class="text-sm font-medium text-slate-700">Pemasok (Supplier)</span>
        </label>
      </div>
    {/if}

    <FormInput label={formData.type === "customer" ? "Nama Pelanggan / Perusahaan" : "Nama Supplier / Toko"} placeholder="Contoh: PT. Maju Jaya" bind:value={formData.name} required />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormInput label="Nama PIC (Penanggung Jawab)" placeholder="Contoh: Budi" bind:value={formData.pic} required />
      <FormInput label="No. WhatsApp / Telepon" type="tel" placeholder="0812..." bind:value={formData.phone} required />
    </div>

    <FormInput label="Email Aktif" type="email" placeholder="email@perusahaan.com" bind:value={formData.email} />

    <div class="flex flex-col gap-1.5 mb-4">
      <label class="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
      <textarea
        bind:value={formData.address}
        rows="3"
        placeholder="Alamat pengiriman / penagihan..."
        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 resize-none"
      ></textarea>
    </div>
  </div>

  {#snippet footer()}
    <button onclick={() => (isModalOpen = false)} class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors"> Batal </button>
    <button onclick={savePartner} class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"> Simpan Data </button>
  {/snippet}
</Modal>
