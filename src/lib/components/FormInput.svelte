<script lang="ts">
  let {
    label,
    id = crypto.randomUUID(),
    type = "text",
    value = $bindable(""),
    placeholder = "",
    required = false,
    disabled = false,
    options = [],
    hint = "",
  }: {
    label: string;
    id?: string;
    type?: string;
    value?: any;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: { value: string; label: string }[];
    hint?: string;
  } = $props();

  const inputClass = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-400/15";
</script>

<div class="flex flex-col gap-1.5">
  <label for={id} class="text-[12px] font-semibold text-gray-600 flex items-center gap-1">
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>

  {#if type === "select"}
    <select {id} bind:value {required} {disabled} class={inputClass}>
      <option value="" disabled selected>Pilih {label}...</option>
      {#each options as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  {:else if type === "textarea"}
    <textarea
      {id}
      bind:value
      {placeholder}
      {required}
      {disabled}
      rows={4}
      class="{inputClass} resize-none"
    ></textarea>
  {:else}
    <input
      {type}
      {id}
      bind:value
      {placeholder}
      {required}
      {disabled}
      class={inputClass}
    />
  {/if}

  {#if hint}
    <p class="text-[11px] text-gray-400">{hint}</p>
  {/if}
</div>
