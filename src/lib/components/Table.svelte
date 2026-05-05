<script lang="ts">
  import { Inbox, Pencil, Trash2 } from "@lucide/svelte";

  let {
    columns = [],
    data = [],
    onEdit,
    onDelete,
    emptyMessage = "Belum ada data.",
    isLoading = false
  }: {
    columns: { label: string; key: string; type?: string }[];
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    emptyMessage?: string;
    isLoading?: boolean;
  } = $props();
</script>

<div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
  <table class="w-full text-left text-[13px] text-gray-600">
    <thead>
      <tr class="border-b border-gray-100 bg-gray-50/50">
        {#each columns as col}
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500">{col.label}</th>
        {/each}
        {#if onEdit || onDelete}
          <th class="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-right">Aksi</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#if isLoading}
        {#each Array(5) as _}
          <tr class="border-b border-gray-50 animate-pulse">
            {#each Array(columns.length + 1) as __}
              <td class="px-5 py-4">
                <div class="h-4 bg-gray-100 rounded-md w-3/4"></div>
              </td>
            {/each}
          </tr>
        {/each}
      {:else if data.length === 0}
        <tr>
          <td colspan={columns.length + 1} class="px-5 py-16 text-center">
            <div class="flex flex-col items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Inbox size={22} class="text-gray-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Belum ada data</p>
                <p class="text-xs text-gray-400 mt-0.5">{emptyMessage}</p>
              </div>
            </div>
          </td>
        </tr>
      {:else}
        {#each data as row, i}
          <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
            {#each columns as col}
              <td class="px-5 py-4">
                {#if col.type === "status"}
                  <span class="badge badge-green">{row[col.key]}</span>
                {:else if col.type === "role"}
                  <span class="badge {row[col.key] === 'admin' || row[col.key] === '🔵 Admin' ? 'badge-indigo' : 'badge-gray'}">
                    {row[col.key]}
                  </span>
                {:else}
                  <span class="text-gray-800 font-medium">{row[col.key]}</span>
                {/if}
              </td>
            {/each}
            {#if onEdit || onDelete}
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  {#if onEdit}
                    <button
                      onclick={() => onEdit(row)}
                      class="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                  {/if}
                  {#if onDelete}
                    <button
                      onclick={() => onDelete(row)}
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  {/if}
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
