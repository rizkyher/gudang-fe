<script lang="ts">
  import { Search, Plus } from "@lucide/svelte";
  import Table from "$lib/components/Table.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import FormInput from "$lib/components/FormInput.svelte";
  import { api } from "$lib/api";
  import { auth } from "$lib/stores/auth.svelte";
  import { onMount } from "svelte";

  let usersList   = $state<any[]>([]);
  let isLoading   = $state(true);
  let isSaving    = $state(false);
  let searchQuery = $state("");
  let isModalOpen = $state(false);
  let isEditing   = $state(false);

  const defaultForm = { id: null, name: "", email: "", password: "", role: "user" };
  let formData = $state({ ...defaultForm });

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "user",  label: "Pengguna (Staff/Guru)" },
  ];

  onMount(async () => { await refreshData(); });

  async function refreshData() {
    isLoading = true;
    try { usersList = await api.get('/users'); }
    catch (e) { console.error(e); }
    finally { isLoading = false; }
  }

  let filteredUsers = $derived(
    usersList
      .filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(u => ({ ...u, role_display: u.role === "admin" ? "Admin" : "Staff", status: "Aktif" }))
  );

  const columns = [
    { label: "Nama",       key: "name"         },
    { label: "Email",      key: "email"        },
    { label: "Role",       key: "role_display", type: "role" },
    { label: "Status",     key: "status",       type: "status" },
  ];

  function openAddModal() {
    isEditing = false; formData = { ...defaultForm }; isModalOpen = true;
  }
  function openEditModal(user: any) {
    isEditing = true; formData = { ...user, password: "" }; isModalOpen = true;
  }

  async function saveUser() {
    isSaving = true;
    try {
      if (isEditing) { await api.put(`/users/${formData.id}`, formData); }
      else           { await api.post('/users', formData); }
      await refreshData();
      isModalOpen = false;
    } catch (e: any) { alert(e.message || "Gagal menyimpan."); }
    finally { isSaving = false; }
  }

  async function deleteUser(user: any) {
    if (user.id === auth.user?.id) { alert("Tidak bisa menghapus akun sendiri."); return; }
    if (!confirm(`Hapus akun "${user.name}"?`)) return;
    try { await api.delete(`/users/${user.id}`); await refreshData(); }
    catch { alert("Gagal menghapus."); }
  }
</script>

<svelte:head>
  <title>Manajemen Pengguna | Khwarizmi Inventory</title>
</svelte:head>

<div class="space-y-5">
  <div class="flex items-end justify-between">
    <div class="page-header">
      <h1>Pengguna</h1>
      <p>Kelola akun dan hak akses sistem</p>
    </div>
    <button onclick={openAddModal} class="btn btn-primary text-sm">
      <Plus size={15} />
      Tambah Pengguna
    </button>
  </div>

  <div class="relative max-w-sm">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Search size={15} class="text-gray-400" />
    </div>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Cari nama atau email..."
      class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15 transition-all"
    />
  </div>

  <Table
    {columns}
    data={filteredUsers}
    {isLoading}
    onEdit={openEditModal}
    onDelete={deleteUser}
    emptyMessage="Belum ada pengguna tambahan."
  />
</div>

<Modal bind:show={isModalOpen} title={isEditing ? "Edit Pengguna" : "Tambah Pengguna"}>
  <div class="space-y-4">
    <FormInput label="Nama Lengkap" placeholder="Budi Santoso" bind:value={formData.name} required />
    <FormInput label="Email" type="email" placeholder="email@khwarizmi.com" bind:value={formData.email} required />
    <FormInput
      label={isEditing ? "Password Baru" : "Password"}
      type="password"
      placeholder="Minimal 6 karakter"
      bind:value={formData.password}
      required={!isEditing}
      hint={isEditing ? "Kosongkan jika tidak ingin mengubah password" : ""}
    />
    <FormInput label="Role" type="select" options={roleOptions} bind:value={formData.role} required />
  </div>

  {#snippet footer()}
    <button onclick={() => (isModalOpen = false)} class="btn btn-ghost text-sm" disabled={isSaving}>Batal</button>
    <button onclick={saveUser} class="btn btn-primary text-sm" disabled={isSaving}>
      {isSaving ? "Menyimpan..." : "Simpan"}
    </button>
  {/snippet}
</Modal>
